import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
@Injectable()
export class RedisService {
  private readonly client: Redis;
  private readonly ttlPodcast: number;
  private readonly ttlRateLimit: number;
  private readonly rateLimit: number;
  private readonly disable: boolean;

  constructor(public config: ConfigService) {
    this.client = new Redis({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      username: config.get('REDIS_USERNAME'),
      password: config.get('REDIS_PASSWORD'),
    });
    //2 weeks
    this.ttlPodcast = 60 * 60 * 24 * 7 * 2;
    // 15 minutes
    this.ttlRateLimit = 60 * 15;
    this.rateLimit = config.get('RATE_LIMIT');
    this.disable = config.get('REDIS_DISABLE') === 'true' ? true : false;
  }

  async get(key: string): Promise<string | null> {
    if (this.disable) return null;
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (this.disable) return;
    const TTL = ttl ?? this.ttlPodcast;
    await this.client.set(key, value, 'EX', TTL);
  }

  async incrementAndCheckRateLimit(userId: string): Promise<boolean> {
    if (this.disable) return false;

    const key = `rateLimit:${userId}`;
    const current = await this.client.incr(key);
    if (current === 1) {
      // If this is the first request, set the expiration time
      await this.client.expire(key, this.ttlRateLimit);
    }
    return current > this.rateLimit;
  }

  async removeAll(): Promise<void> {
    if (this.disable) return;
    await this.client.flushall();
  }

  async removePodcastCache(): Promise<void> {
    if (this.disable) return;
    await this.client.del('podcast-*');
    console.log('podcast cache removed');
  }
}
