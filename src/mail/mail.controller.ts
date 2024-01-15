import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import {
  Permission,
  Permissions,
} from '../auth/decorators/permissions.decorator';
@Controller('mail')
@Permissions(Permission.GENERAL_ADMIN_PERMISSION)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  async test() {
    this.mailService.test();
    return 'sent';
  }
}
