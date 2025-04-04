import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersRepositoryService } from '../users/users-repository.service';
import { CreateUserDTO } from 'src/cores/dtos/create-user.dto';
import { EncryptionsService } from '../encryptions/encryptions.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UsersRepositoryService,
    private encryptionService: EncryptionsService,
  ) {}

  async signUp(createUserDTO: CreateUserDTO) {
    const [userByEmail, userByUsername] = await Promise.all([
      this.userService.findOneByEmail(createUserDTO.email),
      this.userService.findOneByUsername(createUserDTO.username),
    ]);

    if (userByEmail || userByUsername) {
      throw new ConflictException('');
    }

    const hashedPassword = await this.encryptionService.hash(
      createUserDTO.password,
    );

    createUserDTO.password = hashedPassword;
    try {
      await this.userService.create(createUserDTO);

      return {
        success: true,
        message: 'User register successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('');
    }
  }
}
