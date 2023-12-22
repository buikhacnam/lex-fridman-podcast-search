import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Chapter } from 'src/chapter/entities/chapter.entity';

@ObjectType()
export class Podcast {
  @Field(() => Int)
  id: number;

  @Field()
  videoId: string;

  @Field()
  title: string;

  @Field()
  publishedAt: string;

  @Field()
  episode: string;

  @Field()
  guest: string;

  @Field()
  thumbnail: string;

  @Field(() => [Chapter], { nullable: 'items' })
  chapters: Chapter[];
}

@ObjectType()
abstract class PodcastPageInfo {
  @Field()
  hasNextPage: boolean;

  @Field(() => Int, { nullable: true })
  endCursor?: number;
}

@ObjectType()
abstract class PodcastEdge {
  @Field(() => Int)
  cursor: number;

  @Field()
  node: Podcast;
}
@ObjectType()
export class PaginatedPodcast {
  @Field(() => [PodcastEdge], { nullable: true })
  edges: PodcastEdge[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => PodcastPageInfo)
  pageInfo: PodcastPageInfo;
}
