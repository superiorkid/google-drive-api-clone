import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { addSeconds } from 'date-fns';
import { randomBytes } from 'node:crypto';

import { EncryptionsService } from '../encryptions/encryptions.service';
import { TypedEventEmitter } from '../event-emiiter/typed-event-emitter.class';
import { UsersRepositoryService } from '../users/users-repository.service';
import { AuthTokenRepository } from './auth-token.repository';

@Injectable()
export class AuthTokenService {
  constructor(
    private authTokenRepository: AuthTokenRepository,
    private configService: ConfigService,
    private userRepository: UsersRepositoryService,
    private eventEmitter: TypedEventEmitter,
    private encryptionService: EncryptionsService,
  ) {}

  async createVerificationToken(userId: string) {
    await this.authTokenRepository.invalidateUserTokens(
      userId,
      'EMAIL_VERIFICATION',
    );

    const token = randomBytes(32).toString('hex');
    const expiresAt = addSeconds(
      new Date(),
      this.configService.getOrThrow<number>('EMAIL_VERIFICATION_EXPIRATION'),
    );

    await this.authTokenRepository.create({
      token,
      expiresAt,
      userId,
      type: 'EMAIL_VERIFICATION',
    });

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
        verifyLink: verificationLink,
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
    const verification = await this.authTokenRepository.findOneByToken(token);

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
        this.authTokenRepository.update({
          token,
          updateAuthTokenDTO: { used: true, usedAt: new Date() },
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

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found.');

    await this.authTokenRepository.invalidateUserTokens(
      user.id,
      'PASSWORD_RESET',
    );

    try {
      const token = randomBytes(32).toString('hex');
      const expiresAt = addSeconds(
        new Date(),
        this.configService.getOrThrow<number>('PASSWORD_RESET_EXPIRATION'),
      );

      await this.authTokenRepository.create({
        token,
        expiresAt,
        type: 'PASSWORD_RESET',
        userId: user.id,
      });

      const resetLink = `${this.configService.getOrThrow<string>('FRONTEND_URL')}/reset-password?token=${token}`;
      this.eventEmitter.emit('user.resetPassword', {
        resetLink,
        email: user.email,
        username: user.username,
      });

      return {
        success: true,
        message: 'A password reset link has been sent to your email address.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const verification = await this.authTokenRepository.findOneByToken(token);

    if (!verification) throw new BadRequestException('Invalid token');
    if (verification.used) throw new BadRequestException('Token already used.');
    if (verification.expiresAt < new Date())
      throw new BadRequestException('Token expired.');

    try {
      const hashedPassword = await this.encryptionService.hashText(newPassword);
      await Promise.all([
        this.authTokenRepository.update({
          token,
          updateAuthTokenDTO: { used: true, usedAt: new Date() },
        }),
        this.userRepository.update({
          id: verification.userId,
          updateUserDTO: { password: hashedPassword },
        }),
      ]);

      return {
        success: true,
        message: 'Password successfully updated.',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to reset password');
    }
  }
}
