import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as archiver from 'archiver';
import { Response } from 'express';
import { createReadStream, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { UpdateDriveItemDTO } from 'src/cores/dtos/update-driver-item.dto';
import { StorageService } from '../storage/storage.service';
import { DriveItemsRepository } from './drive-items.repository';

@Injectable()
export class DriveItemsService {
  constructor(
    private driveItemRepository: DriveItemsRepository,
    private storageService: StorageService,
  ) {}

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

  async download(id: string, ownerId: string, response: Response) {
    const item = await this.driveItemRepository.findById({ id, ownerId });
    if (!item) throw new NotFoundException('');

    const itemPath = join(process.cwd(), item.url as string);
    const isFolder = item.type === 'FOLDER';

    if (isFolder) {
      response.header('Content-Type', 'application/zip');
      response.header(
        'Content-Desposition',
        `attachment; filename="${item.name}.zip"`,
      );

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(response);

      const addFolderToArchieve = (
        folderPath: string,
        baseInZip: string = '',
      ) => {
        const contents = readdirSync(folderPath);
        for (const name of contents) {
          const fullPath = join(folderPath, name);
          const stat = statSync(fullPath);
          const zipPath = join(baseInZip, name);
          if (stat.isDirectory()) {
            addFolderToArchieve(fullPath, zipPath);
          } else {
            archive.file(fullPath, { name: zipPath });
          }
        }
      };

      addFolderToArchieve(itemPath, item.mimeType as string);
      archive.finalize();
    } else {
      response.setHeader('Content-Type', item.mimeType as string);
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${item.name}"`,
      );
      const stream = createReadStream(itemPath);
      stream.pipe(response);
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

  async getTrashItems(ownerId: string) {
    try {
      const trashedItems =
        await this.driveItemRepository.getTrashedItems(ownerId);
      return {
        success: true,
        message: 'Trashed items retrieved successfully.',
        data: trashedItems,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve trashed items.',
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

  async driveItems(ownerId: string) {
    try {
      const items = await this.driveItemRepository.findRootItems(ownerId);
      return {
        success: true,
        message: 'Drive items retrieved successfully',
        data: items,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve drive items');
    }
  }
}
