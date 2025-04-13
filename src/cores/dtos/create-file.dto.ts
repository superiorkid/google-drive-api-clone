import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class CreateFileDTO {
  @ApiProperty({
    description: 'The file to be uploaded.',
    type: 'string',
    format: 'binary',
  })
  @IsFile()
  file: MemoryStoredFile;

  @ApiPropertyOptional({
    description: 'ID of the parent folder. Null for root level.',
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}
