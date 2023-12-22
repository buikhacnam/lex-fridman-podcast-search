import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobService } from './job.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  providers: [PrismaService, JobService, RedisService],
})
export class JobModule {}
