import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  private readonly logger = new Logger(CustomGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const customSecret = request.headers['custom-secret'];
    const secret = this.configService.get<string>('CUSTOM_SECRET');
    if (customSecret !== secret) {
      this.logger.log('Custom Guard: Unauthorized');
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
