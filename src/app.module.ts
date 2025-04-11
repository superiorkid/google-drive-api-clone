import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DatabasesModule } from './modules/databases/databases.module';
import { EmailsModule } from './modules/emails/emails.module';
import { EncryptionsModule } from './modules/encryptions/encryptions.module';
import { TypedEventEmitterModule } from './modules/event-emiiter/event-emitter.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule,
    UsersModule,
    DatabasesModule,
    EncryptionsModule,
    EmailsModule,
    TypedEventEmitterModule,
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
