import {
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "notification_devices",
  underscored: true,
  indexes: [
    {
      name: "notification_devices_device_idx",
      fields: ["device_id"],
    },
    {
      name: "notification_devices_device_active_idx",
      fields: ["device_id", "is_active"],
    },
    {
      name: "notification_devices_token_unique",
      unique: true,
      fields: ["fcm_token"],
    },
    {
      name: "notification_devices_active_idx",
      fields: ["is_active"],
    },
  ],
})
export class NotificationDeviceModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare deviceId: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare fcmToken: string;

  @Column({ type: DataType.STRING(16), allowNull: false })
  declare platform: string;

  @Column({ type: DataType.STRING(16), allowNull: true })
  declare locale: string | null;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare timezone: string | null;

  @Column({ type: DataType.STRING(32), allowNull: true })
  declare appVersion: string | null;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare isActive: boolean;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  declare lastSeenAt: Date;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
