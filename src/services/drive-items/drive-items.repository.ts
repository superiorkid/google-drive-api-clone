import { Injectable } from '@nestjs/common';
import { DriveItemType } from '@prisma/client';

import { CreateFolderDTO } from 'src/cores/dtos/create-folder.dto';
import { UpdateDriveItemDTO } from 'src/cores/dtos/update-driver-item.dto';
import { DatabasesService } from '../databases/databases.service';

@Injectable()
export class DriveItemsRepository {
  constructor(private db: DatabasesService) {}

  async createFile(params: {
    ownerId: string;
    mimeType: string;
    name: string;
    size: number;
    type: DriveItemType;
    parentId?: string;
    url: string;
  }) {
    const { mimeType, name, size, type, ownerId, parentId, url } = params;
    return this.db.driveItem.create({
      data: {
        name,
        type,
        mimeType,
        size,
        url,
        parentId,
        ownerId,
      },
    });
  }

  async createFolder(params: {
    createFolderDTO: CreateFolderDTO;
    ownerId: string;
  }) {
    const { createFolderDTO, ownerId } = params;
    const { name, type, parentId } = createFolderDTO;
    return this.db.driveItem.create({
      data: { name, type, parentId, ownerId },
    });
  }

  async findById(params: { id: string; ownerId: string }) {
    const { id, ownerId } = params;
    return this.db.driveItem.findFirst({
      where: { AND: [{ id }, { ownerId }] },
      include: {
        children: true,
        parent: true,
      },
    });
  }

  async findByParent(parentId: string) {
    return this.db.driveItem.findFirst({ where: { parentId } });
  }

  async findRootItems(userId: string) {
    return this.db.driveItem.findMany({
      where: { AND: [{ ownerId: userId }, { parentId: null }] },
    });
  }

  async searchByName(ownerId: string, name: string) {
    return this.db.driveItem.findMany({
      where: { AND: [{ ownerId }, { name: { contains: name } }] },
    });
  }

  async getTrashedItems(ownerId: string) {
    return this.db.driveItem.findMany({
      where: { AND: [{ ownerId }, { NOT: { deletedAt: null } }] },
    });
  }

  async softDelete(id: string) {
    return this.db.driveItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.db.driveItem.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async permanentlyDelete(id: string) {
    return this.db.driveItem.delete({ where: { id } });
  }

  async moveToFolder(itemId: string, newParentId: string | null) {
    return this.db.driveItem.update({
      where: { id: itemId },
      data: { parentId: newParentId },
    });
  }

  async update(params: { id: string; updateDriveItemDTO: UpdateDriveItemDTO }) {
    const { id, updateDriveItemDTO } = params;
    const { name, parentId } = updateDriveItemDTO;
    return this.db.driveItem.update({
      where: { id },
      data: { name, parentId },
    });
  }
}
