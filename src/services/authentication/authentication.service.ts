import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenType, User } from '@prisma/client';
import { addSeconds } from 'date-fns';
import { randomBytes } from 'node:crypto';

import { CreateUserDTO } from 'src/cores/dtos/create-user.dto';
import { LoginDTO } from 'src/cores/dtos/login.dto';
import { AuthTokenRepository } from '../auth-token/auth-token.repository';
import { DatabasesService } from '../databases/databases.service';
import { EncryptionsService } from '../encryptions/encryptions.service';
import { TypedEventEmitter } from '../event-emiiter/typed-event-emitter.class';
import { UsersRepositoryService } from '../users/users-repository.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private userRepository: UsersRepositoryService,
    private encryptionService: EncryptionsService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventEmitter: TypedEventEmitter,
    private authTokenRepository: AuthTokenRepository,
  ) {}

  async signUp(createUserDTO: CreateUserDTO) {
    const [userByEmail, userByUsername] = await Promise.all([
      this.userRepository.findOneByEmail(createUserDTO.email),
      this.userRepository.findOneByUsername(createUserDTO.username),
    ]);

    if (userByEmail) throw new ConflictException('Email already in use.');
    if (userByUsername) throw new ConflictException('Username already taken.');

    const hashedPassword = await this.encryptionService.hashText(
      createUserDTO.password,
    );

    try {
      createUserDTO.password = hashedPassword;
      const user = await this.userRepository.create(createUserDTO);

      // generate verification token
      const token = randomBytes(32).toString('hex');
      const expiresAt = addSeconds(
        new Date(),
        this.configService.getOrThrow<number>('EMAIL_VERIFICATION_EXPIRATION'),
      );

      await this.authTokenRepository.create({
        type: AuthTokenType.EMAIL_VERIFICATION,
        expiresAt,
        token,
        userId: user.id,
      });

      const verificationLink = `${this.configService.getOrThrow<string>('APP_URL')}/auth/verify-email?token=${token}`;

      this.eventEmitter.emit('user.welcome', {
        email: createUserDTO.email,
        username: createUserDTO.username,
      });

      this.eventEmitter.emit('user.verifyEmail', {
        username: createUserDTO.username,
        email: createUserDTO.email,
        verifyLink: verificationLink,
      });

      return {
        success: true,
        message: 'User register successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user account.');
    }
  }

  async signIn(user: User) {
    const tokens = await this.getTokens(user);
    const hashedRefreshToken = await this.encryptionService.hashText(
      tokens.refreshToken,
    );
    await this.userRepository.update({
      id: user.id,
      updateUserDTO: { refreshToken: hashedRefreshToken },
    });
    return tokens;
  }

  async validateUser(loginDTO: LoginDTO) {
    const user = await this.userRepository.findOneByEmail(loginDTO.email);

    if (!user) throw new BadRequestException('User does not exists.');
    if (!user.verifyAt)
      throw new ForbiddenException('User email is not verified.');

    const passwordMatches = await this.encryptionService.verifyText(
      user.password || '',
      loginDTO.password,
    );
    if (!passwordMatches)
      throw new BadRequestException('Password does not match.');
    return user;
  }

  async getTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<'string'>(
          'ACCESS_TOKEN_SECRET_KEY',
        ),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<'string'>(
          'REFRESH_TOKEN_SECRET_KEY',
        ),
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new NotFoundException('User not found.');

    try {
      await this.userRepository.update({
        id: userId,
        updateUserDTO: { refreshToken: undefined },
      });

      return {
        success: true,
        message: 'User logged out successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to logout user.');
    }
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOneById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access denied.');
    const refreshTokenMatches = await this.encryptionService.verifyText(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access denied.');

    try {
      const tokens = await this.getTokens(user);
      const hashedRefreshToken = await this.encryptionService.hashText(
        tokens.refreshToken,
      );
      await this.userRepository.update({
        id: user.id,
        updateUserDTO: { refreshToken: hashedRefreshToken },
      });
      return { success: true, data: tokens, message: 'Token refreshed' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to refresh token.');
    }
  }
}
