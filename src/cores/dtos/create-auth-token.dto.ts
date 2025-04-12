import { AuthTokenType } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthTokenDTO {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsDateString()
  @IsNotEmpty()
  expiresAt: Date;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(AuthTokenType)
  @IsNotEmpty()
  type: AuthTokenType;
}
