import { PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString } from 'class-validator';
import { CreateEmailVerificationDTO } from './create-email-verification.dto';

export class UpdateEmailVerificationDTO {
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  used: boolean;

  @IsDateString()
  usedAt: Date;
}
