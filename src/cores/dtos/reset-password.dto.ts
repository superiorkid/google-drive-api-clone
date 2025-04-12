import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class ResetPasswordDTO {
  @ApiProperty({
    description: 'Password reset token received via email',
    required: true,
  })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'StrongP@ssw0rd123',
    minLength: 8,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  password: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'StrongP@ssw0rd123',
    required: true,
  })
  @Match(ResetPasswordDTO, (object) => object.password)
  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  confirmPassword: string;
}
