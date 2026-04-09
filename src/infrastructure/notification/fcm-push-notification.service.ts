import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import {
  Messaging,
  MulticastMessage,
  getMessaging,
} from "firebase-admin/messaging";

import {
  PushNotificationPort,
  SendPushNotificationInput,
  SendPushNotificationResult,
} from "../../application/ports/services/push-notification.port";

const FCM_BATCH_SIZE = 500;

@Injectable()
export class FcmPushNotificationService implements PushNotificationPort {
  private readonly logger = new Logger(FcmPushNotificationService.name);

  private readonly messaging: Messaging | null;

  public constructor(private readonly configService: ConfigService) {
    this.messaging = this.initializeMessaging();
  }

  public async send(
    input: SendPushNotificationInput,
  ): Promise<SendPushNotificationResult> {
    const tokens = Array.from(new Set(input.tokens.filter(Boolean)));

    if (tokens.length === 0) {
      return {
        deliveredCount: 0,
        failedCount: 0,
        skipped: true,
        reason: "Hedef token bulunamadi.",
      };
    }

    if (!this.messaging) {
      return {
        deliveredCount: 0,
        failedCount: 0,
        skipped: true,
        reason: "FCM devre disi veya eksik konfigure edildi.",
      };
    }

    let deliveredCount = 0;
    let failedCount = 0;

    for (let index = 0; index < tokens.length; index += FCM_BATCH_SIZE) {
      const tokenChunk = tokens.slice(index, index + FCM_BATCH_SIZE);
      const response = await this.messaging.sendEachForMulticast(
        this.buildMessage({
          ...input,
          tokens: tokenChunk,
        }),
      );

      deliveredCount += response.successCount;
      failedCount += response.failureCount;
    }

    if (failedCount > 0) {
      this.logger.warn(
        `FCM gonderiminde ${failedCount} hata olustu, ${deliveredCount} teslim edildi.`,
      );
    }

    return {
      deliveredCount,
      failedCount,
      skipped: false,
    };
  }

  private initializeMessaging(): Messaging | null {
    const enabled =
      this.configService.get<string>("FCM_ENABLED", "false") === "true";

    if (!enabled) {
      this.logger.warn("FCM devre disi, bildirimler skip edilecek.");
      return null;
    }

    const projectId = this.configService.get<string>("FCM_PROJECT_ID");
    const clientEmail = this.configService.get<string>("FCM_CLIENT_EMAIL");
    const privateKey = this.configService
      .get<string>("FCM_PRIVATE_KEY", "")
      .replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        "FCM aktif ama kimlik bilgileri eksik, bildirimler skip edilecek.",
      );
      return null;
    }

    const app = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });

    return getMessaging(app);
  }

  private buildMessage(input: SendPushNotificationInput): MulticastMessage {
    const baseData = {
      ...(input.data ?? {}),
      notificationType: input.type,
    };

    if (input.type === "silent-sync") {
      return {
        tokens: input.tokens,
        data: baseData,
        android: {
          priority: "high",
        },
        apns: {
          headers: {
            "apns-push-type": "background",
            "apns-priority": "5",
          },
          payload: {
            aps: {
              contentAvailable: true,
            },
          },
        },
      };
    }

    return {
      tokens: input.tokens,
      notification:
        input.title || input.body
          ? {
              ...(input.title ? { title: input.title } : {}),
              ...(input.body ? { body: input.body } : {}),
            }
          : undefined,
      data: baseData,
      android: {
        priority: "high",
      },
    };
  }
}
