import { Module } from "@nestjs/common";

import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { GetAyahByIdUseCase } from "./use-cases/get-ayah-by-id.use-case";
import { GetDailyPrayerTimesUseCase } from "./use-cases/get-daily-prayer-times.use-case";
import { GetHadithByIdUseCase } from "./use-cases/get-hadith-by-id.use-case";
import { GetPrayerTimesRangeUseCase } from "./use-cases/get-prayer-times-range.use-case";
import { GetQiblaDirectionUseCase } from "./use-cases/get-qibla-direction.use-case";
import { EnqueueNotificationUseCase } from "./use-cases/enqueue-notification.use-case";
import { EnqueueSilentSyncNotificationUseCase } from "./use-cases/enqueue-silent-sync-notification.use-case";
import { ListAyahsUseCase } from "./use-cases/list-ayahs.use-case";
import { ListHadithsUseCase } from "./use-cases/list-hadiths.use-case";
import { PullMobileSyncUseCase } from "./use-cases/pull-mobile-sync.use-case";
import { PushMobileSyncUseCase } from "./use-cases/push-mobile-sync.use-case";
import { RegisterNotificationDeviceUseCase } from "./use-cases/register-notification-device.use-case";
import { SearchAyahUseCase } from "./use-cases/search-ayah.use-case";
import { SearchHadithUseCase } from "./use-cases/search-hadith.use-case";
import { SearchKissaUseCase } from "./use-cases/search-kissa.use-case";

@Module({
  imports: [InfrastructureModule],
  providers: [
    SearchAyahUseCase,
    SearchHadithUseCase,
    SearchKissaUseCase,
    GetDailyPrayerTimesUseCase,
    GetPrayerTimesRangeUseCase,
    ListAyahsUseCase,
    GetAyahByIdUseCase,
    ListHadithsUseCase,
    GetHadithByIdUseCase,
    GetQiblaDirectionUseCase,
    PullMobileSyncUseCase,
    PushMobileSyncUseCase,
    RegisterNotificationDeviceUseCase,
    EnqueueNotificationUseCase,
    EnqueueSilentSyncNotificationUseCase,
  ],
  exports: [
    SearchAyahUseCase,
    SearchHadithUseCase,
    SearchKissaUseCase,
    GetDailyPrayerTimesUseCase,
    GetPrayerTimesRangeUseCase,
    ListAyahsUseCase,
    GetAyahByIdUseCase,
    ListHadithsUseCase,
    GetHadithByIdUseCase,
    GetQiblaDirectionUseCase,
    PullMobileSyncUseCase,
    PushMobileSyncUseCase,
    RegisterNotificationDeviceUseCase,
    EnqueueNotificationUseCase,
    EnqueueSilentSyncNotificationUseCase,
  ],
})
export class ApplicationModule {}
