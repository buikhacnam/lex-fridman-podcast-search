import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../mailer/mailer.service';
import * as path from 'path';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async test(): Promise<void> {
    const emailConfirmTitle = 'Confirm your email';
    const text1 = 'text1';
    const text2 = 'text2';
    const text3 = 'text3';

    const url = 'http://localhost:3000/some-url';

    await this.mailerService.sendMail({
      to: this.configService.get('MAIL_TEST'),
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        process.cwd(),
        'src',
        'mail',
        'mail-templates',
        'test.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: 'My App',
        text1,
        text2,
        text3,
      },
    });
  }
}
