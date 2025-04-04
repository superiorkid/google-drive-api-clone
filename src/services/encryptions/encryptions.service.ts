import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

@Injectable()
export class EncryptionsService {
  async hash(text: string) {
    const hash = await argon2.hash(text);
    return hash;
  }

  async verify(hashedText: string, plainText: string) {
    return argon2.verify(hashedText, plainText);
  }
}
