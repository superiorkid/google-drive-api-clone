import { Injectable } from '@nestjs/common';

import { CreateEmailVerificationDTO } from 'src/cores/dtos/create-email-verification.dto';
import { UpdateEmailVerificationDTO } from 'src/cores/dtos/update-email-verification.dto';
import { DatabasesService } from '../databases/databases.service';

@Injectable()
export class EmailVerificationRepository {
  constructor(private db: DatabasesService) {}

  async create(createEmailVerificationDTO: CreateEmailVerificationDTO) {
    const { userId, expiresAt, token } = createEmailVerificationDTO;
    return this.db.emailVerification.create({
      data: { userId, token, expiresAt },
    });
  }

  async findOneByToken(token: string) {
    return this.db.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async update(params: {
    updateEmailVerificationDTO: UpdateEmailVerificationDTO;
    token: string;
  }) {
    const { token, updateEmailVerificationDTO } = params;
    const { used, usedAt } = updateEmailVerificationDTO;
    return this.db.emailVerification.update({
      where: { token },
      data: { used, usedAt },
    });
  }

  async invalidateUserTokens(userId: string) {
    return this.db.emailVerification.updateMany({
      where: { userId, used: false, expiresAt: { gt: new Date() } },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }
}
