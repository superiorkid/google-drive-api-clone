import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DatabasesModule } from './modules/databases/databases.module';
import { EncryptionsModule } from './modules/encryptions/encryptions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule,
    UsersModule,
    DatabasesModule,
    EncryptionsModule,
  ],
})
export class AppModule {}
