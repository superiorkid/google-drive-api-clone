import { Module } from '@nestjs/common';
import { AuthenticationController } from 'src/controllers/authentication/authentication.controller';
import { AuthenticationService } from 'src/services/authentication/authentication.service';
import { UsersModule } from '../users/users.module';
import { EncryptionsModule } from '../encryptions/encryptions.module';

@Module({
  imports: [UsersModule, EncryptionsModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
