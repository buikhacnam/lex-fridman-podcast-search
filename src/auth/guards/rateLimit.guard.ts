import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const ip = request.headers['x-forwarded-for'] || request.ip;
    console.log('ip', ip);
    const isLimited = await this.redisService.incrementAndCheckRateLimit(ip);

    if (isLimited) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
