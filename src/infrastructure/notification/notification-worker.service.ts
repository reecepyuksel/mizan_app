import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Job, Worker } from "bullmq";
import Redis from "ioredis";

import { NotificationDeviceRegistryPort } from "../../application/ports/services/notification-device-registry.port";
import { QueueNotificationInput } from "../../application/ports/services/notification-queue.port";
import { PushNotificationPort } from "../../application/ports/services/push-notification.port";
import {
  NOTIFICATION_DEVICE_REGISTRY,
  PUSH_NOTIFICATION_SERVICE,
} from "../../application/ports/services/service.tokens";
import {
  NOTIFICATIONS_QUEUE_NAME,
  getRedisConnectionOptions,
} from "./notification.constants";

@Injectable()
export class NotificationWorkerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(NotificationWorkerService.name);

  private worker: Worker<QueueNotificationInput> | null = null;

  private redis: Redis | null = null;

  public constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATION_DEVICE_REGISTRY)
    private readonly notificationDeviceRegistry: NotificationDeviceRegistryPort,
    @Inject(PUSH_NOTIFICATION_SERVICE)
    private readonly pushNotificationService: PushNotificationPort,
  ) {}

  public onApplicationBootstrap(): void {
    this.redis = new Redis(getRedisConnectionOptions(this.configService));
    this.worker = new Worker<QueueNotificationInput>(
      NOTIFICATIONS_QUEUE_NAME,
      async (job) => this.processJob(job),
      {
        connection: this.redis,
        concurrency: Number(
          this.configService.get<number>("NOTIFICATION_WORKER_CONCURRENCY", 5),
        ),
      },
    );

    this.worker.on("failed", (job, error) => {
      this.logger.error(
        `Bildirim isi basarisiz oldu: ${String(job?.id ?? "unknown")}`,
        error.stack,
      );
    });

    this.logger.log("Bildirim worker hazir.");
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.worker?.close();
    await this.redis?.quit();
  }

  private async processJob(job: Job<QueueNotificationInput>) {
    const tokens = await this.resolveTokens(job.data);

    return this.pushNotificationService.send({
      tokens,
      type: job.data.type,
      title: job.data.title,
      body: job.data.body,
      data: job.data.data,
    });
  }

  private async resolveTokens(
    jobData: QueueNotificationInput,
  ): Promise<string[]> {
    const explicitTokens = jobData.fcmTokens ?? [];
    const deviceTokens = jobData.deviceIds?.length
      ? await this.notificationDeviceRegistry.findActiveTokensByDeviceIds(
          jobData.deviceIds,
        )
      : [];

    return Array.from(new Set([...explicitTokens, ...deviceTokens]));
  }
}
