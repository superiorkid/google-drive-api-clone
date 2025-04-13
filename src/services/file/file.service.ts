import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

import { PREVIEWABLE_MIMETYPES } from 'src/cores/constants/previewable-mimetypes.constant';
import { CreateFileDTO } from 'src/cores/dtos/create-file.dto';
import { DriveItemsRepository } from '../drive-items/drive-items.repository';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FileService {
  constructor(
    private driveItemRepository: DriveItemsRepository,
    private storageService: StorageService,
    private configService: ConfigService,
  ) {}

  async uploadFile(params: { createFileDTO: CreateFileDTO; ownerId: string }) {
    const { createFileDTO, ownerId } = params;
    const { file, parentId } = createFileDTO;

    try {
      const savedFile = await this.storageService.save(file, `user-${ownerId}`);
      const fileUrl = this.generateFileURL(savedFile.filename);

      await this.driveItemRepository.createFile({
        ownerId,
        parentId,
        mimeType: file.mimeType,
        name: savedFile.filename,
        size: file.size,
        type: 'FILE',
        url: fileUrl,
      });

      return {
        success: true,
        message: 'File uploaded successfully.',
      };
    } catch (error) {
      console.error('error', error);
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  async previewFile(params: {
    id: string;
    ownerId: string;
    response: Response;
  }) {
    const { id, ownerId, response } = params;
    const file = await this.driveItemRepository.findById({ id, ownerId });

    if (!file || !this.isFilePreviewable(file.mimeType as string)) {
      throw new ForbiddenException('Preview not allowed for this file type.');
    }

    response.setHeader('Content-Type', file.mimeType as string);
    response.setHeader('Content-Disposition', `inline; filename=${file.name}`);

    const stream = createReadStream(file.url as string);
    stream.pipe(response);
  }

  private generateFileURL(filename: string) {
    const baseUrl = this.configService.getOrThrow<string>('APP_URL');
    const uploadPath = join('uploads', filename).replace(/\\/g, '/');
    return `${baseUrl}/${uploadPath}`;
  }

  private isFilePreviewable(mimeType: string) {
    return PREVIEWABLE_MIMETYPES.some((type) => mimeType.startsWith(type));
  }
}
