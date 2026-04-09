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
  tableName: "user_notes",
  underscored: true,
  indexes: [
    {
      name: "user_notes_device_idx",
      fields: ["device_id"],
    },
    {
      name: "user_notes_device_updated_idx",
      fields: ["device_id", "updated_at"],
    },
    {
      name: "user_notes_deleted_at_idx",
      fields: ["deleted_at"],
    },
  ],
})
export class UserNoteModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare deviceId: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare entityType: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare entityId: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare note: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare deletedAt: Date | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
