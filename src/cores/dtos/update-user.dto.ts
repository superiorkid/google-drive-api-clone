import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { CreateUserDTO } from './create-user.dto';

export class UpdateUserDTO extends PartialType(
  OmitType(CreateUserDTO, ['confirmPassword'] as const),
) {
  @ApiPropertyOptional({
    description: 'User role',
    enum: Role,
    example: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Timestamp when user was verified.',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  verifyAt?: Date;

  @ApiPropertyOptional({
    description: 'Timestamp of last login.',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date;

  @ApiPropertyOptional({
    description: 'Refresh token for authentication.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
