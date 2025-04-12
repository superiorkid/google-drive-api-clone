import { PickType } from '@nestjs/swagger';
import { CreateUserDTO } from './create-user.dto';

export class ForgotPasswordDTO extends PickType(CreateUserDTO, [
  'email',
] as const) {}
