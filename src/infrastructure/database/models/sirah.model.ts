import {
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "sirahs",
  underscored: true,
  indexes: [
    {
      name: "sirahs_search_vector_gin_idx",
      using: "gin",
      fields: ["search_vector"],
    },
    {
      name: "sirahs_part_unit_order_idx",
      fields: ["part_title", "unit_number", "order"],
    },
    {
      name: "sirahs_updated_at_idx",
      fields: ["updated_at"],
    },
  ],
})
export class SirahModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare title: string;

  @Unique
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare slug: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare partTitle: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare unitNumber: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare unitTitle: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare order: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare summary: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;

  @Column({ type: DataType.TSVECTOR, allowNull: true })
  declare searchVector: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
