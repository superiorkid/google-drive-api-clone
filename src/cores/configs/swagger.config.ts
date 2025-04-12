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
    .addBearerAuth()
    .addTag('Authentication', 'User login, logout, and token operations')
    .addTag(
      'Users',
      'Operations related to user management such as profile retrieval, updates, and deletion',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
}
