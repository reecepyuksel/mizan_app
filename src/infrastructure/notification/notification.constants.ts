import { ConfigService } from "@nestjs/config";
import { RedisOptions } from "ioredis";

export const NOTIFICATIONS_QUEUE_NAME = "notifications";
export const VISIBLE_NOTIFICATION_JOB = "visible";
export const SILENT_SYNC_NOTIFICATION_JOB = "silent-sync";

export function getRedisConnectionOptions(
  configService: ConfigService,
): RedisOptions {
  const password = configService.get<string>("REDIS_PASSWORD");

  return {
    host: configService.get<string>("REDIS_HOST", "localhost"),
    port: Number(configService.get<number>("REDIS_PORT", 6379)),
    db: Number(configService.get<number>("REDIS_DB", 0)),
    ...(password ? { password } : {}),
    maxRetriesPerRequest: null,
  };
}
