import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerConfig(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Google Drive API Clone')
    .setDescription(
      `
## API Overview
A comprehensive RESTful API clone of Google Drive functionality with complete file management, user authentication, and sharing capabilities.

## Key Features

### Authentication & Users
- **JWT-based authentication** with refresh tokens
- **User profile management** including retrieval, updates, and deletion

### Drive Management
- **File operations**: Upload, download, move, rename, and delete files
- **Folder operations**: Create, organize, and manage directory structures
- **Trash management**: Move items to trash, restore, or permanently delete

### Sharing & Permissions
- **Granular access control**: Grant and revoke permissions at the item level
- **Permission management**: View and modify user access levels (read, edit, etc.)

## API Versioning
Current stable version: 1.0

## Authentication
All protected endpoints require Bearer token authentication in the format:
\`Authorization: Bearer <access_token>\`

## Rate Limiting

| Endpoint Category      | Time Window | Max Requests | Protection Purpose                  |
|------------------------|-------------|--------------|--------------------------------------|
| **Auth Routes**        | 60 seconds  | 10 calls   | Prevent brute-force attacks          |
| **File Uploads**       | 60 seconds  | 5 calls    | Protect server resources             |
| **All Other Endpoints**| 60 seconds  | 60 calls  | Balanced protection and usability    |

`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
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
    .addTag(
      'Drive - Folders',
      'Operations for folder management, including creation and organization of directory structures',
    )
    .addTag(
      'Drive Item Permissions',
      'Manage access control for drive items, including granting, revoking, and listing permissions',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
