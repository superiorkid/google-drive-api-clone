import { Module } from '@nestjs/common';

import { DriveItemController } from 'src/controllers/drive-item/drive-item.controller';
import { FileController } from 'src/controllers/file/file.controller';
import { FoldersController } from 'src/controllers/folders/folders.controller';
import { DriveItemsRepository } from 'src/services/drive-items/drive-items.repository';
import { DriveItemsService } from 'src/services/drive-items/drive-items.service';
import { FileService } from 'src/services/file/file.service';
import { FoldersService } from 'src/services/folders/folders.service';
import { DatabasesModule } from '../databases/databases.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule, DatabasesModule],
  controllers: [FileController, FoldersController, DriveItemController],
  providers: [
    FileService,
    FoldersService,
    DriveItemsRepository,
    DriveItemsService,
  ],
  exports: [DriveItemsRepository],
})
export class DriveItemsModule {}
