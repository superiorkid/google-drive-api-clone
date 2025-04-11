import { Module } from '@nestjs/common';

import { DatabasesService } from 'src/services/databases/databases.service';

@Module({
  providers: [DatabasesService],
  exports: [DatabasesService],
})
export class DatabasesModule {}
