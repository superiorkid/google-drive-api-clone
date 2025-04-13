import { Injectable } from '@nestjs/common';
import { access, mkdir, writeFile } from 'fs/promises';
import { MemoryStoredFile } from 'nestjs-form-data';
import { join } from 'node:path';

@Injectable()
export class StorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirectory();
  }

  async save(file: MemoryStoredFile, prefix: string = '') {
    try {
      const fileExt = file.originalName.split('.').pop();
      const uniqueId = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 10),
      ).join('');
      const uniqueFilename = `${prefix}${uniqueId}.${fileExt}`;
      const filePath = join(this.uploadDir, uniqueFilename);

      await writeFile(filePath, file.buffer);

      return {
        filename: uniqueFilename,
        path: filePath,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  private async ensureUploadDirectory() {
    try {
      await access(this.uploadDir);
    } catch {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }
}
