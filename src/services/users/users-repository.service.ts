import { Injectable } from '@nestjs/common';

import { CreateUserDTO } from 'src/cores/dtos/create-user.dto';
import { UpdateUserDTO } from 'src/cores/dtos/update-user.dto';
import { DatabasesService } from '../databases/databases.service';

@Injectable()
export class UsersRepositoryService {
  constructor(private db: DatabasesService) {}

  async findOneById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }

  async findOneByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  async findOneByUsername(username: string) {
    return this.db.user.findUnique({ where: { username } });
  }

  async findMany(params: { take: number; skip: number }) {
    const { skip = 0, take = 10 } = params;
    return this.db.user.findMany({ take, skip });
  }

  async delete(id: string) {
    return this.db.user.delete({ where: { id } });
  }

  async deleteMany(ids: string[]) {
    return this.db.user.deleteMany({ where: { id: { in: ids } } });
  }

  async create(createUserDTO: CreateUserDTO) {
    const { email, password, username } = createUserDTO;
    return this.db.user.create({ data: { email, username, password } });
  }

  async update(params: { updateUserDTO: UpdateUserDTO; id: string }) {
    const { id, updateUserDTO } = params;
    const {
      email,
      verifyAt,
      lastLoginAt,
      password,
      refreshToken,
      role,
      username,
    } = updateUserDTO;
    return this.db.user.update({
      where: { id },
      data: {
        email,
        username,
        password,
        verifyAt,
        lastLoginAt,
        refreshToken,
        role,
      },
    });
  }
}
