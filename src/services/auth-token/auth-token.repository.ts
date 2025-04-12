import { Injectable } from '@nestjs/common';

import { AuthTokenType } from '@prisma/client';
import { CreateAuthTokenDTO } from 'src/cores/dtos/create-auth-token.dto';
import { UpdateAuthTokenDTO } from 'src/cores/dtos/update-auth-token.dto';
import { DatabasesService } from '../databases/databases.service';

@Injectable()
export class AuthTokenRepository {
  constructor(private db: DatabasesService) {}

  async create(createAuthTokenDTO: CreateAuthTokenDTO) {
    const { userId, expiresAt, token, type } = createAuthTokenDTO;
    return this.db.authToken.create({
      data: { userId, token, expiresAt, type },
    });
  }

  async findOneByToken(token: string) {
    return this.db.authToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async update(params: {
    updateAuthTokenDTO: UpdateAuthTokenDTO;
    token: string;
  }) {
    const { token, updateAuthTokenDTO } = params;
    const { used, usedAt } = updateAuthTokenDTO;
    return this.db.authToken.update({
      where: { token },
      data: { used, usedAt },
    });
  }

  async invalidateUserTokens(userId: string, type: AuthTokenType) {
    return this.db.authToken.updateMany({
      where: { userId, used: false, expiresAt: { gt: new Date() }, type },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }
}
