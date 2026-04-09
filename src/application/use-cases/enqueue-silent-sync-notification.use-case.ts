import { Inject, Injectable } from "@nestjs/common";

import {
  NotificationQueuePort,
  QueueNotificationResult,
} from "../ports/services/notification-queue.port";
import { NOTIFICATION_QUEUE } from "../ports/services/service.tokens";

export interface EnqueueSilentSyncNotificationInput {
  deviceIds?: string[];
  fcmTokens?: string[];
  reason?: string;
  entityType?: string;
  entityId?: string;
}

@Injectable()
export class EnqueueSilentSyncNotificationUseCase {
  public constructor(
    @Inject(NOTIFICATION_QUEUE)
    private readonly notificationQueue: NotificationQueuePort,
  ) {}

  public execute(
    input: EnqueueSilentSyncNotificationInput,
  ): Promise<QueueNotificationResult> {
    return this.notificationQueue.enqueue({
      type: "silent-sync",
      deviceIds: input.deviceIds,
      fcmTokens: input.fcmTokens,
      data: {
        syncRequired: "true",
        ...(input.reason ? { reason: input.reason } : {}),
        ...(input.entityType ? { entityType: input.entityType } : {}),
        ...(input.entityId ? { entityId: input.entityId } : {}),
      },
    });
  }
}
