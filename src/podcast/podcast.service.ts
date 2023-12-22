import { Injectable } from '@nestjs/common';
import { PodcastArgs } from './dto/podcast.args';
import { PrismaService } from 'src/prisma/prisma.service';
import { Podcast } from './entities/podcast.entity';

@Injectable()
export class PodcastService {
  constructor(private readonly prisma: PrismaService) {}
  async searchPodcast(podcastArgs: PodcastArgs) {
    const { cursor, limit, title, order } = podcastArgs;
    const CURSOR = cursor ? cursor?.toString() : undefined;
    let node = [] as Podcast[];
    let hasNextPage = false;
    let endCursor = null;
    const whereBlock = {
      OR: [
        {
          title: {
            contains: title,
          },
        },
        {
          guest: {
            contains: title,
          },
        },
        // Chapters
        {
          chapters: {
            some: {
              name: {
                contains: title,
              },
            },
          },
        },
      ],
    };
    const totalCount = await this.prisma.podcast.count({
      where: whereBlock,
      cursor: CURSOR ? { episode: CURSOR } : undefined,
    });

    if (totalCount > 0) {
      node = await this.prisma.podcast.findMany({
        cursor: CURSOR ? { episode: CURSOR } : undefined,
        where: whereBlock,
        include: {
          chapters: {
            orderBy: {
              orderNum: 'asc',
            },
            where: {
              OR: [
                {
                  name: {
                    contains: title,
                  },
                },
                {
                  Podcast: {
                    title: {
                      contains: title,
                    },
                  },
                },
              ],
            },
          },
        },
        take: limit,
        orderBy: {
          publishedAt: order,
        },
      });
      hasNextPage = totalCount > limit;
      endCursor = node[node.length - 1].episode;
    }
    return {
      edges: node.map((node) => ({
        cursor: node.episode,
        node,
      })),
      totalCount,
      pageInfo: {
        hasNextPage,
        endCursor,
      },
    };
  }
}
