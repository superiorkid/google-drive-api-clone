import { Module } from '@nestjs/common';

import { DriveItemPermissionsController } from 'src/controllers/drive-item-permissions/drive-item-permissions.controller';
import { DriveItemPermissionsRepository } from 'src/services/drive-item-permissions/drive-item-permissions.repository';
import { DriveItemPermissionsService } from 'src/services/drive-item-permissions/drive-item-permissions.service';
import { DatabasesModule } from '../databases/databases.module';

@Module({
  imports: [DatabasesModule],
  controllers: [DriveItemPermissionsController],
  providers: [DriveItemPermissionsService, DriveItemPermissionsRepository],
  exports: [DriveItemPermissionsRepository],
})
export class DriveItemPermissionsModule {}
