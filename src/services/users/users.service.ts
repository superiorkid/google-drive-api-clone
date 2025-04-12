import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { UsersRepositoryService } from './users-repository.service';
import { UpdateUserDTO } from 'src/cores/dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepositoryService) {}

  async getCurrentUser(userId: string) {
    try {
      const user = await this.usersRepository.findOneById(userId);
      if (!user) throw new NotFoundException('User not found.');

      return {
        success: true,
        message: 'User profile retrieved successfully.',
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve user profile.',
      );
    }
  }

  // async updateCurrentUser(params: {
  //   userId: string;
  //   updateUserDTO: UpdateUserDTO;
  // }) {
  //   const { updateUserDTO, userId } = params;

  //   const user = await this.usersRepository.findOneById(userId);
  //   if (!user) throw new NotFoundException('User not found.');

  //   try {
  //   } catch (error) {
  //     throw new InternalServerErrorException('');
  //   }
  // }

  async getUserByUsername(username: string) {
    try {
      const user = await this.usersRepository.findOneByUsername(username);
      if (!user) throw new NotFoundException('User not found.');

      return {
        success: true,
        message: 'User profile retrieved successfully.',
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('');
    }
  }
}
