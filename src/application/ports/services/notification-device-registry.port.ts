export type NotificationPlatform = "android" | "ios" | "web";

export interface RegisterNotificationDeviceInput {
  deviceId: string;
  fcmToken: string;
  platform: NotificationPlatform;
  locale?: string;
  timezone?: string;
  appVersion?: string;
}

export interface NotificationDeviceRecord {
  id: string;
  deviceId: string;
  fcmToken: string;
  platform: NotificationPlatform;
  locale?: string;
  timezone?: string;
  appVersion?: string;
  isActive: boolean;
  lastSeenAt: Date;
}

export interface NotificationDeviceRegistryPort {
  register(
    input: RegisterNotificationDeviceInput,
  ): Promise<NotificationDeviceRecord>;
  findActiveTokensByDeviceIds(deviceIds: string[]): Promise<string[]>;
}
