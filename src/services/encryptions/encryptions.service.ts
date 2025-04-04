import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class EncryptionsService {
  async hashText(text: string) {
    try {
      return argon2.hash(text);
    } catch (error) {
      throw new InternalServerErrorException('Failed to hash data.');
    }
  }

  async verifyText(hashedText: string, plainText: string) {
    try {
      return argon2.verify(hashedText, plainText);
    } catch (error) {
      throw new InternalServerErrorException('Failed to verify data.');
    }
  }
}
