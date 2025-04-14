import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

import { PREVIEWABLE_MIMETYPES } from 'src/cores/constants/previewable-mimetypes.constant';
import { CreateFileDTO } from 'src/cores/dtos/create-file.dto';
import { UpdateDriveItemDTO } from 'src/cores/dtos/update-driver-item.dto';
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

      await this.driveItemRepository.createFile({
        ownerId,
        parentId,
        mimeType: file.mimeType,
        name: file.originalName,
        size: file.size,
        type: 'FILE',
        url: savedFile.path,
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

  async trash(itemId: string, ownerId: string) {
    const driveItem = await this.driveItemRepository.findById({
      ownerId,
      id: itemId,
    });
    if (!driveItem) throw new NotFoundException('Drive item not found.');

    try {
      await this.driveItemRepository.softDelete(itemId);

      return {
        success: true,
        message: 'File successfully moved to trash.',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete file.');
    }
  }

  async detail(itemId: string, ownerId: string) {
    try {
      const driveItem = await this.driveItemRepository.findById({
        ownerId,
        id: itemId,
      });
      if (!driveItem) throw new NotFoundException('Drive item not found.');

      return {
        success: true,
        message: 'File detail retrieved successfully.',
        data: driveItem,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve file details.',
      );
    }
  }

  async restore(itemId: string, ownerId: string) {
    const driveItem = await this.driveItemRepository.findById({
      ownerId,
      id: itemId,
    });

    if (!driveItem) throw new NotFoundException('Drive item not found.');
    if (!driveItem.deletedAt)
      throw new ForbiddenException('File is not in the trash.');

    try {
      await this.driveItemRepository.restore(itemId);

      return {
        success: true,
        message: 'File successfully restored from trash.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to restore file from trash.',
      );
    }
  }

  async permanentDelete(itemId: string, ownerId: string) {
    const driveItem = await this.driveItemRepository.findById({
      ownerId,
      id: itemId,
    });
    if (!driveItem) throw new NotFoundException('Drive item not found.');
    if (!driveItem.deletedAt)
      throw new ForbiddenException('File is not in the trash.');

    try {
      if (driveItem.type === 'FOLDER') {
        const children = driveItem.children;
        for (const child of children) {
          await this.permanentDelete(child.id, ownerId);
        }
      } else {
        if (driveItem.url) {
          await this.storageService.delete(driveItem.url);
        }
      }

      await this.driveItemRepository.permanentlyDelete(itemId);
    } catch (error) {
      throw new InternalServerErrorException('');
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

    const filePath = join(process.cwd(), file.url as string);

    response.setHeader('Content-Type', file.mimeType as string);
    response.setHeader(
      'Content-Disposition',
      `inline; filename="${file.name}"`,
    );

    const stream = createReadStream(filePath);
    stream.pipe(response);
  }

  async update(params: {
    id: string;
    ownerId: string;
    data: UpdateDriveItemDTO;
  }) {
    const { id, data, ownerId } = params;
    const file = await this.driveItemRepository.findById({ id, ownerId });

    if (!file) throw new NotFoundException('File not found');
    if (file.deletedAt)
      throw new ForbiddenException('Cannot update a deleted file');

    try {
      const { name, parentId } = data;
      await this.driveItemRepository.update({
        id,
        updateDriveItemDTO: { name, parentId },
      });

      return {
        success: true,
        message: 'File updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update file');
    }
  }

  private isFilePreviewable(mimeType: string) {
    return PREVIEWABLE_MIMETYPES.some((type) => mimeType.startsWith(type));
  }
}
