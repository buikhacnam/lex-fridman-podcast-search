import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Chapter {
  @Field()
  videoId: string;

  @Field()
  name: string;

  @Field(() => Int)
  orderNum: number;

  @Field()
  timestamp: string;

  @Field(() => Int)
  start: number;

  @Field(() => Int, { nullable: true })
  end?: number;

  @Field(() => Int)
  podcastId: number;
}
