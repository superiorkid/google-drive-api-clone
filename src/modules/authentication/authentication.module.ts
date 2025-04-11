import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from 'src/controllers/authentication/authentication.controller';
import { AccessTokenGuard } from 'src/cores/guards/access-token.guard';
import { AccessTokenStrategy } from 'src/cores/strategies/access-token.strategy';
import { LocalStrategy } from 'src/cores/strategies/local.strategy';
import { RefreshTokenStrategy } from 'src/cores/strategies/refresh-token.strategy';
import { AuthenticationService } from 'src/services/authentication/authentication.service';
import { EmailVerificationRepository } from 'src/services/email-verification/email-verification.repository';
import { EmailVerificationService } from 'src/services/email-verification/email-verification.service';
import { EncryptionsModule } from '../encryptions/encryptions.module';
import { UsersModule } from '../users/users.module';
import { DatabasesModule } from '../databases/databases.module';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    EncryptionsModule,
    DatabasesModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    EmailVerificationRepository,
    EmailVerificationService,
    { provide: APP_GUARD, useClass: AccessTokenGuard },
  ],
})
export class AuthenticationModule {}
