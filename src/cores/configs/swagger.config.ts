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
    .addTag(
      'Drive Item',
      'Operations for managing drive items such as files and folders, including updating metadata, moving to trash, restoring, and permanent deletion',
    )
    .addTag(
      'Drive - Files',
      'Operations related to file management, including upload, download, and deletion',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
}
