import { Inject, Injectable } from "@nestjs/common";

import {
  NotificationQueuePort,
  QueueNotificationInput,
} from "../ports/services/notification-queue.port";
import { NOTIFICATION_QUEUE } from "../ports/services/service.tokens";

@Injectable()
export class EnqueueNotificationUseCase {
  public constructor(
    @Inject(NOTIFICATION_QUEUE)
    private readonly notificationQueue: NotificationQueuePort,
  ) {}

  public execute(input: QueueNotificationInput) {
    return this.notificationQueue.enqueue(input);
  }
}
