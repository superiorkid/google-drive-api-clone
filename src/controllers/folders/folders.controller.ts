import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('folders')
@ApiTags('Folders')
@ApiBearerAuth()
export class FoldersController {
  constructor() {}
}
