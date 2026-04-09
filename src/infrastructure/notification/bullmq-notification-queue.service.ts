import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JobsOptions, Queue } from "bullmq";
import Redis from "ioredis";

import {
  NotificationQueuePort,
  QueueNotificationInput,
  QueueNotificationResult,
} from "../../application/ports/services/notification-queue.port";
import {
  NOTIFICATIONS_QUEUE_NAME,
  SILENT_SYNC_NOTIFICATION_JOB,
  VISIBLE_NOTIFICATION_JOB,
  getRedisConnectionOptions,
} from "./notification.constants";

@Injectable()
export class BullmqNotificationQueueService
  implements NotificationQueuePort, OnApplicationShutdown
{
  private readonly logger = new Logger(BullmqNotificationQueueService.name);

  private readonly redis: Redis;

  private readonly queue: Queue<QueueNotificationInput>;

  public constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(getRedisConnectionOptions(this.configService));
    this.queue = new Queue<QueueNotificationInput>(NOTIFICATIONS_QUEUE_NAME, {
      connection: this.redis,
    });
  }

  public async enqueue(
    input: QueueNotificationInput,
  ): Promise<QueueNotificationResult> {
    const options: JobsOptions = {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    };

    const job = await this.queue.add(
      input.type === "silent-sync"
        ? SILENT_SYNC_NOTIFICATION_JOB
        : VISIBLE_NOTIFICATION_JOB,
      input,
      options,
    );

    this.logger.log(
      `Bildirim kuyruga eklendi: ${job.name} (${String(job.id)})`,
    );

    return {
      jobId: String(job.id),
      queuedAt: Date.now(),
    };
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.queue.close();
    await this.redis.quit();
  }
}
