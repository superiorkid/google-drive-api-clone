import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationController } from 'src/controllers/authentication/authentication.controller';
import { AccessTokenGuard } from 'src/cores/guards/access-token.guard';
import { RolesGuard } from 'src/cores/guards/roles.guard';
import { AccessTokenStrategy } from 'src/cores/strategies/access-token.strategy';
import { LocalStrategy } from 'src/cores/strategies/local.strategy';
import { RefreshTokenStrategy } from 'src/cores/strategies/refresh-token.strategy';
import { AuthTokenRepository } from 'src/services/auth-token/auth-token.repository';
import { AuthTokenService } from 'src/services/auth-token/auth-token.service';
import { AuthenticationService } from 'src/services/authentication/authentication.service';
import { DatabasesModule } from '../databases/databases.module';
import { EncryptionsModule } from '../encryptions/encryptions.module';
import { UsersModule } from '../users/users.module';

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
    AuthTokenRepository,
    AuthTokenService,
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthenticationModule {}
