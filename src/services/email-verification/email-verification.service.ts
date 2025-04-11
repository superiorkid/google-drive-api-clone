import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import { TypedEventEmitter } from '../event-emiiter/typed-event-emitter.class';
import { UsersRepositoryService } from '../users/users-repository.service';
import { EmailVerificationRepository } from './email-verification.repository';
import { addSeconds } from 'date-fns';

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

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = addSeconds(
      new Date(),
      this.configService.getOrThrow<number>('EMAIL_VERIFICATION_EXPIRATION'),
    );

    await this.emailVerificationRepository.create({ token, expiresAt, userId });

    return token;
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new NotFoundException('User not found.');
    if (user.verifyAt) throw new BadRequestException('Email already verified.');

    const token = await this.createVerificationToken(userId);
    const verificationLink = `${this.configService.getOrThrow<string>('APP_URL')}/verify-email?token=${token}`;

    this.eventEmitter.emit('user.verifyEmail', {
      email: user.email,
      username: user.username,
      link: verificationLink,
    });
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
