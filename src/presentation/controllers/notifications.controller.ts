import { Body, Controller, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { EnqueueNotificationUseCase } from "../../application/use-cases/enqueue-notification.use-case";
import { EnqueueSilentSyncNotificationUseCase } from "../../application/use-cases/enqueue-silent-sync-notification.use-case";
import { RegisterNotificationDeviceUseCase } from "../../application/use-cases/register-notification-device.use-case";
import { EnqueueNotificationDto } from "../dto/enqueue-notification.dto";
import { RegisterNotificationDeviceDto } from "../dto/register-notification-device.dto";
import { SilentSyncNotificationDto } from "../dto/silent-sync-notification.dto";

@Controller("notifications")
@ApiTags("Notifications")
export class NotificationsController {
  public constructor(
    private readonly registerNotificationDeviceUseCase: RegisterNotificationDeviceUseCase,
    private readonly enqueueNotificationUseCase: EnqueueNotificationUseCase,
    private readonly enqueueSilentSyncNotificationUseCase: EnqueueSilentSyncNotificationUseCase,
  ) {}

  @Post("devices/register")
  @ApiOperation({ summary: "Cihaz FCM token kaydi veya guncellemesi" })
  @ApiOkResponse({ description: "Kaydedilen cihaz token bilgisi" })
  public registerDevice(@Body() body: RegisterNotificationDeviceDto) {
    return this.registerNotificationDeviceUseCase.execute(body);
  }

  @Post("send")
  @ApiOperation({ summary: "BullMQ kuyruguna gorunen bildirim ekle" })
  @ApiOkResponse({ description: "Olusan queue job bilgisi" })
  public enqueue(@Body() body: EnqueueNotificationDto) {
    return this.enqueueNotificationUseCase.execute(body);
  }

  @Post("silent-sync")
  @ApiOperation({ summary: "Sessiz senkronizasyon bildirimi kuyruga ekle" })
  @ApiOkResponse({ description: "Olusan queue job bilgisi" })
  public enqueueSilentSync(@Body() body: SilentSyncNotificationDto) {
    return this.enqueueSilentSyncNotificationUseCase.execute(body);
  }
}
