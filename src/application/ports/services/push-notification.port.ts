import { NotificationJobType } from "./notification-queue.port";

export interface SendPushNotificationInput {
  tokens: string[];
  type: NotificationJobType;
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

export interface SendPushNotificationResult {
  deliveredCount: number;
  failedCount: number;
  skipped: boolean;
  reason?: string;
}

export interface PushNotificationPort {
  send(input: SendPushNotificationInput): Promise<SendPushNotificationResult>;
}
