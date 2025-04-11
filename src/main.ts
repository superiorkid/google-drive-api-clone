import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { globalConfig } from './cores/configs/global.config';
import { swaggerConfig } from './cores/configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  swaggerConfig(app);
  await globalConfig(app, configService);
}
bootstrap();
