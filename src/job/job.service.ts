import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Chapter } from 'src/chapter/entities/chapter.entity';
import { Podcast } from 'src/podcast/entities/podcast.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import YoutubeChaptersFinder from 'youtube-chapters-finder';
@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    public config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9PM)
  async handlePodcastCron() {
    const now = new Date();
    const whatTimeIsIt = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    this.logger.log(whatTimeIsIt + '| cron job running...');
    await this.getLexFridmanPodcasts();
    this.logger.log('cron job done.');
  }

  private async getLexFridmanPodcasts(): Promise<void> {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const LEX_PODCAST_ID = 'PLrAXtmErZgOdP_8GztsuKi9nrraNbKKp4';
    const MAX_RESULTS = process.env.MAX_RESULTS || 10;
    try {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${MAX_RESULTS}&order=date&playlistId=${LEX_PODCAST_ID}&key=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      await this.executeLexPodcast(data);
    } catch (error) {
      console.error('Error fetching playlist items:', error);
    }
  }

  private async executeLexPodcast(data: any) {
    const videoListPromises = data.items.map(async (item: any) => {
      //check if videoId is in db
      const videoId = item.snippet.resourceId.videoId;

      console.log('videoId', videoId);

      const existed = await this.prisma.podcast.findUnique({
        where: {
          videoId,
        },
      });

      if (existed) {
        console.warn('existed');
        return null;
      }

      const title = item.snippet.title;
      // title: title: 'Mohammed El-Kurd: Palestine | Lex Fridman Podcast #391',
      const episode = title.split('#')[1];
      const guest = title.split(':')[0];

      const chapters: Chapter[] = await this.extractChapters(videoId, title);

      return {
        videoId,
        title,
        podcast: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.medium.url,
        episode,
        guest,
        chapters,
      };
    });

    let videoList = await Promise.all(videoListPromises);
    videoList = videoList.filter((item) => item !== null);
    this.logger.log('saving....');

    if (videoList?.length === 0) {
      this.logger.warn('No new videos found.');
      return;
    }

    videoList = videoList.map((item: Podcast) => {
      return {
        videoId: item.videoId,
        title: item.title,
        publishedAt: item.publishedAt,
        episode: item.episode,
        guest: item.guest,
        thumbnail: item.thumbnail,
        chapters: {
          create: item.chapters.map((chapter: Chapter) => {
            return {
              videoId: chapter.videoId,
              name: chapter.name,
              orderNum: chapter.orderNum,
              timestamp: chapter.timestamp,
              start: chapter.start,
              end: chapter.end,
            };
          }),
        },
      };
    });

    // save all videos to db
    for (const video of videoList) {
      await this.prisma.podcast.create({
        data: video,
      });
    }

    await this.redisService.removePodcastCache();

    //revalidate cache in the frontend
    const res = await fetch(
      `${this.config.get('FRONTEND_URL')}/api/revalidate`,
      {
        method: 'GET',
        headers: {
          Authorization: this.config.get('REVALIDATE_SECRET_KEY'),
        },
      },
    );

    const status = await res.status;
    this.logger.log('frontend revalidate status: ' + status);

    this.logger.log('DONE SAVING');
  }

  private async extractChapters(videoId: string, videoTitle: string) {
    const chapters: any[] = await YoutubeChaptersFinder.getChapter(videoId);
    chapters.map((chapter, index) => {
      chapter.videoId = videoId;
      chapter.videoTitle = videoTitle;
      chapter.orderNum = index;
      chapter.start = this.timestampToSeconds(chapter.time);
      chapter.name =
        chapter.title?.length > 191
          ? chapter.title.slice(0, 188) + '...'
          : chapter.title;
      chapter.timestamp = chapter.time;
    });

    //end of video will be the second of next chapter
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const nextChapter = chapters[i + 1];
      if (nextChapter) {
        chapter.end = nextChapter.start;
      }
    }

    return chapters;
  }

  timestampToSeconds(timestamp: string): number {
    const parts = timestamp.split(':').map(Number);
    let seconds = 0;

    if (parts.length === 3) {
      seconds += parts[0] * 3600; // hours to seconds
      seconds += parts[1] * 60; // minutes to seconds
      seconds += parts[2]; // seconds
    } else if (parts.length === 2) {
      seconds += parts[0] * 60; // minutes to seconds
      seconds += parts[1]; // seconds
    }

    return seconds;
  }
}
