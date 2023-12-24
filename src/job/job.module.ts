import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobService } from './job.service';
import { RedisService } from 'src/redis/redis.service';
import { JobResolver } from './job.resolver';

@Module({
  providers: [PrismaService, JobResolver, JobService, RedisService],
})
export class JobModule {}
