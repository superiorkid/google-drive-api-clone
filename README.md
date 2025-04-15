# 📁 Google Drive API Clone

A comprehensive RESTful API clone of Google Drive built with **NestJS**, supporting complete file and folder management, user authentication, and granular sharing/permissions control.

---

## 🚀 Features

### 🔐 Authentication & Users

- JWT-based **access and refresh token** authentication
- **User profile management**: retrieve, update, delete

### 🗂️ Drive Item Management

- **File operations**: upload, download, rename, move, and delete
- **Folder operations**: create, structure, and organize
- **Trash support**: soft-delete (move to trash), restore, and permanent delete

### 👥 Sharing & Permissions

- Granular **access control** at the file/folder level
- **Permission types**: read-only, write access
- Assign or revoke permissions per user

---

## 🧪 API Documentation

Interactive Swagger documentation is available at:

📍 **[http://localhost:3000/docs](http://localhost:3000/docs)**

### 📑 Tags

- **Authentication** – User login, logout, and token operations
- **Users** – Profile management
- **Drive Item** – Operations for all drive items (files/folders)
- **Drive - Files** – File-specific features (upload, download, delete)
- **Drive - Folders** – Folder-specific features (create, structure)
- **Drive Item Permissions** – Manage sharing and user access

---

## 🔐 Authentication

All protected endpoints require a **Bearer Token** in the request header: `Authorization: Bearer <access_token>`

---

## 📊 Rate Limiting

| Endpoint Category   | Time Window | Max Requests | Purpose                            |
| ------------------- | ----------- | ------------ | ---------------------------------- |
| **Auth Routes**     | 60 seconds  | 10 requests  | Prevent brute-force login attempts |
| **File Uploads**    | 60 seconds  | 5 requests   | Prevent server overload            |
| **Other Endpoints** | 60 seconds  | 60 requests  | Balanced for user operations       |

---

## 🧱 Tech Stack

- **Framework**: [NestJS](https://nestjs.com)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT (access & refresh tokens)
- **Docs**: Swagger (`@nestjs/swagger`)
- **Rate Limiting**: `@nestjs/throttler`

---

## 🛠️ Setup & Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run start:dev

# Open Swagger docs
http://localhost:8000/docs
```
