import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AccessTokenGuard } from './auth/guards/accessToken.guard';
import { PodcastModule } from './podcast/podcast.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './job/job.module';
import { RedisModule } from './redis/redis.module';
import { GoogleAuthModule } from 'src/google-auth/google-auth.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    JobModule,
    AuthModule,
    UserModule,
    PodcastModule,
    GoogleAuthModule,
    MailModule,
    MailerModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
