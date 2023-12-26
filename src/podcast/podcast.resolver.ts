import { Resolver, Query, Args } from '@nestjs/graphql';
import { PodcastService } from './podcast.service';
import { PaginatedPodcast, Podcast } from './entities/podcast.entity';
import { PodcastArgs } from './dto/podcast.args';
import { RedisService } from 'src/redis/redis.service';
// import {
//   Permission,
//   Permissions,
// } from 'src/auth/decorators/permissions.decorator';
import { Logger, UseGuards } from '@nestjs/common';
import { RateLimitGuard } from 'src/auth/guards/rateLimit.guard';
@Resolver(() => Podcast)
@UseGuards(RateLimitGuard)
export class PodcastResolver {
  private readonly logger = new Logger(PodcastResolver.name);
  constructor(
    private readonly podcastService: PodcastService,
    private readonly redisService: RedisService,
  ) {}

  @Query(() => PaginatedPodcast, { name: 'searchPodcast' })
  // @Permissions(Permission.GENERAL_USER_PERMISSION)
  async search(@Args() podcastArgs: PodcastArgs) {
    console.log('podcastArgs', podcastArgs);
    const title = podcastArgs?.title?.toLowerCase() ?? undefined;
    const order = podcastArgs?.order === 'asc' ? 'asc' : 'desc';
    const limit = Math.max(Math.min(podcastArgs?.limit, 20), 2);
    const cursor = podcastArgs?.cursor ?? undefined;
    const args = title + order + limit + cursor;
    const cacheKey = `${this.redisService.podcastKey}${args}`;
    let result: any = await this.redisService.get(cacheKey);
    if (!result) {
      this.logger.log('No cache found: ' + cacheKey);
      result = await this.podcastService.searchPodcast(podcastArgs);
      await this.redisService.set(cacheKey, JSON.stringify(result));
    } else {
      this.logger.log('Cache found: ' + cacheKey);
      result = JSON.parse(result);
    }
    return result;
  }
}
