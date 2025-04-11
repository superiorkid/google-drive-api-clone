import { Module } from '@nestjs/common';

import { EncryptionsService } from 'src/services/encryptions/encryptions.service';

@Module({
  providers: [EncryptionsService],
  exports: [EncryptionsService],
})
export class EncryptionsModule {}
