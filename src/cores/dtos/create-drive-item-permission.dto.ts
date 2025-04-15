import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateDriveItemPermissionDTO {
  @ApiProperty({
    description: 'The ID of the user to grant permission to',
    example: 'a1b2c3d4-e5f6-7890-g1h2-3456ij7890kl',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The type of permission to grant',
    enum: PermissionType,
    enumName: 'PermissionType',
    example: PermissionType.READ,
    required: true,
  })
  @IsEnum(PermissionType)
  permission: PermissionType;
}
