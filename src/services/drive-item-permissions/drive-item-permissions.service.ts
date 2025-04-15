import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PermissionType } from '@prisma/client';
import { DriveItemPermissionsRepository } from './drive-item-permissions.repository';

@Injectable()
export class DriveItemPermissionsService {
  constructor(
    private driveItemPermissionRepository: DriveItemPermissionsRepository,
  ) {}

  async grantPermission(
    userId: string,
    driveItemId: string,
    permission: PermissionType,
  ) {
    const existingPermission =
      await this.driveItemPermissionRepository.findByUserAndItem(
        userId,
        driveItemId,
      );

    if (existingPermission) {
      if (existingPermission.permission === permission) {
        throw new ConflictException(
          'User already has the requested permission.',
        );
      } else {
        await this.driveItemPermissionRepository.revokePermission(
          userId,
          driveItemId,
        );
      }
    }

    try {
      await this.driveItemPermissionRepository.grantPermission(
        userId,
        driveItemId,
        permission,
      );

      return {
        success: true,
        message: 'Permission granted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to grant permission');
    }
  }

  async getUsersWithAccess(driveItemId: string) {
    try {
      const users =
        await this.driveItemPermissionRepository.getUsersWithAccess(
          driveItemId,
        );

      return {
        success: true,
        message: 'Users with access retrieved successfully',
        data: users,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve users with access',
      );
    }
  }

  async revokePermission(userId: string, driveItemId: string) {
    const existingPermission =
      await this.driveItemPermissionRepository.findByUserAndItem(
        userId,
        driveItemId,
      );

    if (!existingPermission) throw new NotFoundException();

    try {
      await this.driveItemPermissionRepository.revokePermission(
        userId,
        driveItemId,
      );

      return {
        success: true,
        message: '',
      };
    } catch (error) {
      throw new InternalServerErrorException('');
    }
  }
}
