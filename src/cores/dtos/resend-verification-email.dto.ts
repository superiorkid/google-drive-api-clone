import { PickType } from '@nestjs/swagger';
import { CreateUserDTO } from './create-user.dto';

export class ResendVerificationEmailDTO extends PickType(CreateUserDTO, [
  'email',
] as const) {}
