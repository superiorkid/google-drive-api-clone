import { Module } from '@nestjs/common';

import { FileController } from 'src/controllers/file/file.controller';
import { FoldersController } from 'src/controllers/folders/folders.controller';
import { DriveItemsRepository } from 'src/services/drive-items/drive-items.repository';
import { FileService } from 'src/services/file/file.service';
import { FoldersService } from 'src/services/folders/folders.service';
import { DatabasesModule } from '../databases/databases.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule, DatabasesModule],
  controllers: [FileController, FoldersController],
  providers: [FileService, FoldersService, DriveItemsRepository],
  exports: [DriveItemsRepository],
})
export class DriveItemsModule {}
