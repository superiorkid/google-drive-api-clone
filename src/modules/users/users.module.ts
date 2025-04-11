import { Module } from '@nestjs/common';

import { UsersRepositoryService } from 'src/services/users/users-repository.service';
import { UsersService } from 'src/services/users/users.service';
import { DatabasesModule } from '../databases/databases.module';

@Module({
  imports: [DatabasesModule],
  providers: [UsersRepositoryService, UsersService],
  exports: [UsersRepositoryService],
})
export class UsersModule {}
