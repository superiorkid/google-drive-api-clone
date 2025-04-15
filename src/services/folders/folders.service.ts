import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { CreateFolderDTO } from 'src/cores/dtos/create-folder.dto';
import { DriveItemsRepository } from '../drive-items/drive-items.repository';

@Injectable()
export class FoldersService {
  constructor(private driveItemRepository: DriveItemsRepository) {}

  async create(params: { ownerId: string; createFolderDTO: CreateFolderDTO }) {
    const { createFolderDTO, ownerId } = params;
    const { name, parentId } = createFolderDTO;
    try {
      await this.driveItemRepository.createFolder({
        ownerId,
        createFolderDTO: { name, parentId },
      });

      return {
        success: true,
        message: 'Folder created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create folder');
    }
  }
}
