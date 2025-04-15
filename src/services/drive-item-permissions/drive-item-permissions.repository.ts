import { Injectable } from '@nestjs/common';
import { PermissionType } from '@prisma/client';

import { DatabasesService } from '../databases/databases.service';

@Injectable()
export class DriveItemPermissionsRepository {
  constructor(private db: DatabasesService) {}

  async findByUserAndItem(userId: string, driveItemId: string) {
    return this.db.driveItemPermission.findFirst({
      where: { AND: [{ userId }, { driveItemId }] },
    });
  }

  async hasReadAccess(userId: string, driveItemId: string) {
    return this.db.driveItemPermission.findFirst({
      where: {
        AND: [{ userId, driveItemId, permission: { in: ['READ', 'WRITE'] } }],
      },
    });
  }

  async hasWriteAccess(userId: string, driveItemId: string) {
    return this.db.driveItemPermission.findFirst({
      where: {
        AND: [{ userId, driveItemId, permission: 'WRITE' }],
      },
    });
  }

  async grantPermission(
    userId: string,
    driveItemId: string,
    permission: PermissionType,
  ) {
    return this.db.driveItemPermission.upsert({
      where: { userId_driveItemId: { userId, driveItemId } },
      update: {
        permission,
      },
      create: {
        userId,
        driveItemId,
        permission,
      },
    });
  }

  async revokePermission(userId: string, driveItemId: string) {
    return this.db.driveItemPermission.deleteMany({
      where: { AND: [{ userId, driveItemId }] },
    });
  }

  async getUsersWithAccess(driveItemId: string) {
    return this.db.driveItemPermission.findMany({
      where: { driveItemId },
      include: { user: true },
    });
  }
}
