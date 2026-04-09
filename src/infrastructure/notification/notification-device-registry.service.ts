import { Injectable } from "@nestjs/common";
import { Op } from "sequelize";

import {
  NotificationDeviceRecord,
  NotificationDeviceRegistryPort,
  RegisterNotificationDeviceInput,
} from "../../application/ports/services/notification-device-registry.port";
import { NotificationDeviceModel } from "../database/models/notification-device.model";

@Injectable()
export class NotificationDeviceRegistryService implements NotificationDeviceRegistryPort {
  public async register(
    input: RegisterNotificationDeviceInput,
  ): Promise<NotificationDeviceRecord> {
    const now = new Date();

    await NotificationDeviceModel.update(
      { isActive: false },
      {
        where: {
          deviceId: input.deviceId,
          platform: input.platform,
          fcmToken: {
            [Op.ne]: input.fcmToken,
          },
        },
      },
    );

    const existingRecord = await NotificationDeviceModel.findOne({
      where: {
        fcmToken: input.fcmToken,
      },
    });

    if (existingRecord) {
      await existingRecord.update({
        deviceId: input.deviceId,
        platform: input.platform,
        locale: input.locale ?? null,
        timezone: input.timezone ?? null,
        appVersion: input.appVersion ?? null,
        isActive: true,
        lastSeenAt: now,
      });

      return this.toRecord(existingRecord);
    }

    const createdRecord = await NotificationDeviceModel.create({
      deviceId: input.deviceId,
      fcmToken: input.fcmToken,
      platform: input.platform,
      locale: input.locale ?? null,
      timezone: input.timezone ?? null,
      appVersion: input.appVersion ?? null,
      isActive: true,
      lastSeenAt: now,
    });

    return this.toRecord(createdRecord);
  }

  public async findActiveTokensByDeviceIds(
    deviceIds: string[],
  ): Promise<string[]> {
    if (deviceIds.length === 0) {
      return [];
    }

    const rows = await NotificationDeviceModel.findAll({
      attributes: ["fcmToken"],
      where: {
        deviceId: {
          [Op.in]: deviceIds,
        },
        isActive: true,
      },
      raw: true,
    });

    return rows.map((row) => row.fcmToken);
  }

  private toRecord(model: NotificationDeviceModel): NotificationDeviceRecord {
    return {
      id: model.id,
      deviceId: model.deviceId,
      fcmToken: model.fcmToken,
      platform: model.platform as NotificationDeviceRecord["platform"],
      locale: model.locale ?? undefined,
      timezone: model.timezone ?? undefined,
      appVersion: model.appVersion ?? undefined,
      isActive: model.isActive,
      lastSeenAt: model.lastSeenAt,
    };
  }
}
