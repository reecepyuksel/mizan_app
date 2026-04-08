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
  tableName: "hadiths",
  underscored: true,
  indexes: [
    {
      name: "hadiths_search_vector_gin_idx",
      using: "gin",
      fields: ["search_vector"],
    },
  ],
})
export class HadithModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare source: string;

  @Column({ type: DataType.STRING(120), allowNull: true })
  declare chapter: string | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;

  @Column({ type: DataType.TSVECTOR, allowNull: true })
  declare searchVector: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
