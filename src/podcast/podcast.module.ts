import { Module } from '@nestjs/common';
import { PodcastService } from './podcast.service';
import { PodcastResolver } from './podcast.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  providers: [PodcastResolver, PodcastService, PrismaService, RedisService],
})
export class PodcastModule {}
