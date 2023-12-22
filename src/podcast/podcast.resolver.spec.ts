import { Test, TestingModule } from '@nestjs/testing';
import { PodcastResolver } from './podcast.resolver';
import { PodcastService } from './podcast.service';

describe('PodcastResolver', () => {
  let resolver: PodcastResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PodcastResolver, PodcastService],
    }).compile();

    resolver = module.get<PodcastResolver>(PodcastResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
