import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DatabasesModule } from './modules/databases/databases.module';
import { DriveItemsModule } from './modules/drive-items/drive-items.module';
import { EmailsModule } from './modules/emails/emails.module';
import { EncryptionsModule } from './modules/encryptions/encryptions.module';
import { TypedEventEmitterModule } from './modules/event-emiiter/event-emitter.module';
import { StorageModule } from './modules/storage/storage.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    NestjsFormDataModule.config({ isGlobal: true }),
    AuthenticationModule,
    UsersModule,
    DatabasesModule,
    EncryptionsModule,
    EmailsModule,
    TypedEventEmitterModule,
    StorageModule,
    DriveItemsModule,
  ],
})
export class AppModule {}
