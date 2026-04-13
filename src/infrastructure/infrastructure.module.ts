import { Module } from "@nestjs/common";

import {
  AYAH_REPOSITORY,
  HADITH_REPOSITORY,
  KISSA_REPOSITORY,
  SIRAH_REPOSITORY,
} from "../application/ports/repositories/repository.tokens";
import {
  MOBILE_SYNC_SERVICE,
  NOTIFICATION_DEVICE_REGISTRY,
  NOTIFICATION_QUEUE,
  PRAYER_TIME_CALCULATOR,
  PUSH_NOTIFICATION_SERVICE,
  QIBLA_CALCULATOR,
} from "../application/ports/services/service.tokens";
import { DatabaseModule } from "./database/database.module";
import { AyahSequelizeRepository } from "./database/repositories/ayah-sequelize.repository";
import { HadithSequelizeRepository } from "./database/repositories/hadith-sequelize.repository";
import { KissaSequelizeRepository } from "./database/repositories/kissa-sequelize.repository";
import { SirahSequelizeRepository } from "./database/repositories/sirah-sequelize.repository";
import { BullmqNotificationQueueService } from "./notification/bullmq-notification-queue.service";
import { FcmPushNotificationService } from "./notification/fcm-push-notification.service";
import { NotificationDeviceRegistryService } from "./notification/notification-device-registry.service";
import { NotificationWorkerService } from "./notification/notification-worker.service";
import { AdhanPrayerTimeCalculatorService } from "./prayer/adhan-prayer-time-calculator.service";
import { SphericalQiblaCalculatorService } from "./qibla/spherical-qibla-calculator.service";
import { WatermelonSyncService } from "./sync/watermelon-sync.service";

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: AYAH_REPOSITORY,
      useClass: AyahSequelizeRepository,
    },
    {
      provide: HADITH_REPOSITORY,
      useClass: HadithSequelizeRepository,
    },
    {
      provide: KISSA_REPOSITORY,
      useClass: KissaSequelizeRepository,
    },
    {
      provide: SIRAH_REPOSITORY,
      useClass: SirahSequelizeRepository,
    },
    {
      provide: PRAYER_TIME_CALCULATOR,
      useClass: AdhanPrayerTimeCalculatorService,
    },
    {
      provide: QIBLA_CALCULATOR,
      useClass: SphericalQiblaCalculatorService,
    },
    {
      provide: MOBILE_SYNC_SERVICE,
      useClass: WatermelonSyncService,
    },
    {
      provide: NOTIFICATION_DEVICE_REGISTRY,
      useClass: NotificationDeviceRegistryService,
    },
    {
      provide: NOTIFICATION_QUEUE,
      useClass: BullmqNotificationQueueService,
    },
    {
      provide: PUSH_NOTIFICATION_SERVICE,
      useClass: FcmPushNotificationService,
    },
    NotificationWorkerService,
  ],
  exports: [
    AYAH_REPOSITORY,
    HADITH_REPOSITORY,
    KISSA_REPOSITORY,
    SIRAH_REPOSITORY,
    PRAYER_TIME_CALCULATOR,
    QIBLA_CALCULATOR,
    MOBILE_SYNC_SERVICE,
    NOTIFICATION_DEVICE_REGISTRY,
    NOTIFICATION_QUEUE,
    PUSH_NOTIFICATION_SERVICE,
  ],
})
export class InfrastructureModule {}
