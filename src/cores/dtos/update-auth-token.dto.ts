import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString } from 'class-validator';

export class UpdateAuthTokenDTO {
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  used: boolean;

  @IsDateString()
  usedAt: Date;
}
