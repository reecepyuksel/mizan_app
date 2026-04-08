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
  tableName: "ayahs",
  underscored: true,
  indexes: [
    {
      name: "ayahs_search_vector_gin_idx",
      using: "gin",
      fields: ["search_vector"],
    },
  ],
})
export class AyahModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  declare id: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare surahNumber: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare ayahNumber: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare arabicText: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare turkishMeal: string;

  @Column({ type: DataType.TSVECTOR, allowNull: true })
  declare searchVector: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
