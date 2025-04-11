import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Match } from '../decorators/match.decorator';

export class CreateUserDTO {
  @ApiProperty({
    description: 'The username of the user.',
    example: 'susan',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description: 'The email address of the user.',
    example: 'susan@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password for the user.',
    example: 'Password123!',
    minLength: 8,
    maxLength: 32,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @ApiProperty({
    description: 'Password confirmation, must match the password field',
    example: 'Password123!',
  })
  @Match(CreateUserDTO, (object) => object.password)
  confirmPassword: string;
}
