import { Module } from "@nestjs/common";

import { ApplicationModule } from "../application/application.module";
import { ContentController } from "./controllers/content.controller";
import { NotificationsController } from "./controllers/notifications.controller";
import { PrayerTimesController } from "./controllers/prayer-times.controller";
import { QiblaController } from "./controllers/qibla.controller";
import { SearchController } from "./controllers/search.controller";
import { SyncController } from "./controllers/sync.controller";

@Module({
  imports: [ApplicationModule],
  controllers: [
    SearchController,
    PrayerTimesController,
    ContentController,
    NotificationsController,
    QiblaController,
    SyncController,
  ],
})
export class PresentationModule {}
