import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { addSeconds } from 'date-fns';
import { randomBytes } from 'node:crypto';

import { TypedEventEmitter } from '../event-emiiter/typed-event-emitter.class';
import { UsersRepositoryService } from '../users/users-repository.service';
import { EmailVerificationRepository } from './email-verification.repository';

@Injectable()
export class EmailVerificationService {
  constructor(
    private emailVerificationRepository: EmailVerificationRepository,
    private configService: ConfigService,
    private userRepository: UsersRepositoryService,
    private eventEmitter: TypedEventEmitter,
  ) {}

  async createVerificationToken(userId: string) {
    await this.emailVerificationRepository.invalidateUserTokens(userId);

    const token = randomBytes(32).toString('hex');
    const expiresAt = addSeconds(
      new Date(),
      this.configService.getOrThrow<number>('EMAIL_VERIFICATION_EXPIRATION'),
    );

    await this.emailVerificationRepository.create({ token, expiresAt, userId });

    return token;
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found.');
    if (user.verifyAt) throw new BadRequestException('Email already verified.');

    try {
      const token = await this.createVerificationToken(user.id);
      const verificationLink = `${this.configService.getOrThrow<string>('APP_URL')}/auth/verify-email?token=${token}`;

      this.eventEmitter.emit('user.verifyEmail', {
        email: user.email,
        username: user.username,
        link: verificationLink,
      });

      return {
        success: true,
        message:
          'Verification email has been resent successfully. Please check your inbox.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to resend verification email. Please try again later.',
      );
    }
  }

  async verifyEmail(token: string) {
    const verification =
      await this.emailVerificationRepository.findOneByToken(token);

    if (!verification) throw new BadRequestException('Invalid token');
    if (verification.used) throw new BadRequestException('Token already used');
    if (verification.expiresAt < new Date())
      throw new BadRequestException('Token expired');

    try {
      await Promise.all([
        this.userRepository.update({
          id: verification.userId,
          updateUserDTO: { verifyAt: new Date() },
        }),
        this.emailVerificationRepository.update({
          token,
          updateEmailVerificationDTO: { used: true, usedAt: new Date() },
        }),
      ]);

      return {
        success: true,
        message: 'Email successfully verified',
        data: {
          redirect: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/sign-in`,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to verify email.');
    }
  }
}
