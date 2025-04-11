import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmailVerificationDTO {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsDateString()
  @IsNotEmpty()
  expiresAt: Date;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
