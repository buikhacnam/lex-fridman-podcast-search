import { Resolver, Mutation } from '@nestjs/graphql';
import { RedisService } from 'src/redis/redis.service';
import {
  Permissions,
  Permission,
} from 'src/auth/decorators/permissions.decorator';
import { UseGuards } from '@nestjs/common';
import { RateLimitGuard } from 'src/auth/guards/rateLimit.guard';
@Resolver()
@UseGuards(RateLimitGuard)
@Permissions(Permission.GENERAL_ADMIN_PERMISSION)
export class RedisResolver {
  constructor(private readonly redisService: RedisService) {}

  @Mutation(() => String)
  removeAllRateLimit() {
    return this.redisService.removeAllRateLimit();
  }

  @Mutation(() => String)
  removePodcastCache() {
    return this.redisService.removePodcastCache();
  }

  @Mutation(() => String)
  removeAll() {
    return this.redisService.removeAll();
  }
}
