import { Module } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { RedisResolver } from './redis.resolver';

@Module({
  providers: [RedisService, RedisResolver],
})
export class RedisModule {}
