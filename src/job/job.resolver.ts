import { Resolver, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JobService } from 'src/job/job.service';
import { RateLimitGuard } from 'src/auth/guards/rateLimit.guard';
import {
  Permissions,
  Permission,
} from 'src/auth/decorators/permissions.decorator';
@Resolver()
@UseGuards(RateLimitGuard)
export class JobResolver {
  constructor(private readonly jobService: JobService) {}

  @Mutation(() => String)
  @Permissions(Permission.GENERAL_ADMIN_PERMISSION)
  podcastCron() {
    this.jobService.handlePodcastCron();
    return 'ok';
  }
}
