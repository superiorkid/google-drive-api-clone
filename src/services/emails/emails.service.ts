import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventPayloads } from 'src/cores/interfaces/event-payloads.interface';

@Injectable()
export class EmailsService {
  constructor(private mailerService: MailerService) {}

  @OnEvent('user.welcome')
  async welcomEmail(data: EventPayloads['user.welcome']) {
    const { email, username } = data;
    const subject = `Welcome to GDrive clone ${username}`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: './welcome',
      context: {
        username,
      },
    });
  }

  @OnEvent('user.verifyEmail')
  async verifyEmail(data: EventPayloads['user.verifyEmail']) {
    const { email, link, username } = data;
    const subject = `GDrive clone: Verify your account!`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: './verify-email',
      context: {
        username,
        link,
      },
    });
  }
}
