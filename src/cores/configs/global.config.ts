import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export async function globalConfig(
  app: INestApplication,
  configService: ConfigService,
) {
  const globalPrefix = configService.getOrThrow<string>('GLOBAL_PREFIX');
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  console.log(
    `Application running on http://localhost:${port}/${globalPrefix}`,
  );
}
