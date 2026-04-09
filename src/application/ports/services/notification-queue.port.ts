export type NotificationJobType = "visible" | "silent-sync";

export interface QueueNotificationInput {
  type: NotificationJobType;
  title?: string;
  body?: string;
  data?: Record<string, string>;
  deviceIds?: string[];
  fcmTokens?: string[];
}

export interface QueueNotificationResult {
  jobId: string;
  queuedAt: number;
}

export interface NotificationQueuePort {
  enqueue(input: QueueNotificationInput): Promise<QueueNotificationResult>;
}
