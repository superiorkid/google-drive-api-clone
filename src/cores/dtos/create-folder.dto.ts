import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriveItemType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderDTO {
  @ApiProperty({
    description: 'The name of the folder to be created.',
    example: 'My New Folder',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description:
      'The ID of the parent folder. If not provided, the folder will be created at the root level.',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({
    description:
      'The type of the drive item. For creating a folder, this should always be FOLDER.',
    enum: DriveItemType,
    default: DriveItemType.FOLDER,
    example: DriveItemType.FOLDER,
  })
  @IsEnum(DriveItemType)
  type: DriveItemType = DriveItemType.FOLDER;
}
