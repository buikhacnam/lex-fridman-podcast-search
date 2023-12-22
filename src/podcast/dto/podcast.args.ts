import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class PodcastArgs {
  @Field(() => Int, {
    nullable: true,
  })
  cursor?: number;

  @Field(() => Int, {
    defaultValue: 10,
    nullable: true,
  })
  limit?: number;

  @Field({
    nullable: true,
  })
  title?: string;

  @Field({ nullable: true, defaultValue: 'desc' })
  order?: 'asc' | 'desc';
}
