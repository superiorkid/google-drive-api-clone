import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString } from 'class-validator';

export class UpdateEmailVerificationDTO {
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  used: boolean;

  @IsDateString()
  usedAt: Date;
}
