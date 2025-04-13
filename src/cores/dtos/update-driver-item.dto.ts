import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDriveItemDTO {
  @ApiPropertyOptional({
    description: 'The new name for the drive item.',
    example: 'New Name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'The new parent folder ID for the drive item.',
    example: 'new-parent-folder-id',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
