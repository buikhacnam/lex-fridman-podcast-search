import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}
  private readonly logger = new Logger(RateLimitGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const ip =
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.ip;
    const isLimited = await this.redisService.incrementAndCheckRateLimit(ip);
    this.logger.log('IP: ' + ip + ' isLimited?: ' + isLimited);
    if (isLimited) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
