import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { DriveItemType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateFileDTO } from './create-file.dto';

export class CreateFolderDTO extends PickType(CreateFileDTO, [
  'parentId',
] as const) {
  @ApiProperty({
    description: 'The name of the folder to be created.',
    example: 'My New Folder',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
