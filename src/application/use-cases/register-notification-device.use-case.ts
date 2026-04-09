import { Inject, Injectable } from "@nestjs/common";

import {
  NotificationDeviceRegistryPort,
  RegisterNotificationDeviceInput,
} from "../ports/services/notification-device-registry.port";
import { NOTIFICATION_DEVICE_REGISTRY } from "../ports/services/service.tokens";

@Injectable()
export class RegisterNotificationDeviceUseCase {
  public constructor(
    @Inject(NOTIFICATION_DEVICE_REGISTRY)
    private readonly notificationDeviceRegistry: NotificationDeviceRegistryPort,
  ) {}

  public execute(input: RegisterNotificationDeviceInput) {
    return this.notificationDeviceRegistry.register(input);
  }
}
