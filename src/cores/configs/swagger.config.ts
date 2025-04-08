import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerConfig(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Google Drive API Clone')
    .setDescription(
      `
## API Overview
RESTful API clone of Google Drive functionality with file management, user authentication, and sharing capabilities.

## Key Features
- **User Authentication**: JWT-based auth with refresh tokens

## API Versioning
Current stable version: 1.0

## Authentication
Bearer token authentication required for protected endpoints.
  `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token in the format: Bearer <token>',
      },
      'access-token',
    )
    .addTag('Authentication', 'User login, logout, and token operations')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
}
