import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private readonly ttlPodcast: number;
  private readonly ttlRateLimit: number;
  private readonly rateLimit: number;
  private readonly disable: boolean;
  readonly podcastKey = 'podcast-';
  readonly ratelimitKey = 'rateLimit-';

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
    const redisStatus = config.get('REDIS_DISABLE') === 'true' ? true : false;
    this.logger.log('redis is disabled?: ' + redisStatus);
    this.disable = redisStatus;
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

  async incrementAndCheckRateLimit(id: string): Promise<boolean> {
    if (this.disable) return false;
    const key = `${this.ratelimitKey}${id}`;
    const current = await this.client.incr(key);
    if (current === 1) {
      // If this is the first request, set the expiration time
      await this.client.expire(key, this.ttlRateLimit);
    }
    return current > this.rateLimit;
  }

  async removeAll(): Promise<string> {
    if (this.disable) return 'disabled';
    try {
      this.client.flushall();
      this.logger.log('all cache removed');
      return 'ok';
    } catch (error) {
      this.logger.error('error remove all catch: ' + error);
      return 'error';
    }
  }

  async removePodcastCache(): Promise<string> {
    if (this.disable) return 'disabled';
    return this.client
      .keys(this.podcastKey + '*', async (_err, keys) => {
        const pipeline = this.client.pipeline();
        keys.forEach((key) => {
          pipeline.del(key);
        });
        await pipeline.exec();
      })
      .then(() => {
        this.logger.log('podcast cache removed');
        return 'ok';
      })
      .catch((error) => {
        this.logger.error('error remove podcast catch: ' + error);
        return 'error';
      });
  }

  async removeAllRateLimit(): Promise<string> {
    if (this.disable) return 'disabled';
    return this.client
      .keys(this.ratelimitKey + '*', async (_err, keys) => {
        const pipeline = this.client.pipeline();
        keys.forEach((key) => {
          pipeline.del(key);
        });
        await pipeline.exec();
      })
      .then(() => {
        this.logger.log('ratelimit cache removed');
        return 'ok';
      })
      .catch((error) => {
        this.logger.error('error remove ratelimit catch: ' + error);
        return 'error';
      });
  }
}
