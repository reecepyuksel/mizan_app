import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class AyahReferenceQueryDto {
  @ApiProperty({
    description: "Sure numarasi",
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  surahNumber!: number;

  @ApiProperty({
    description: "Ayet numarasi",
    example: 255,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ayahNumber!: number;

  @ApiPropertyOptional({
    description: "Meal dahil olsun mu",
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toLowerCase() === "true" : Boolean(value),
  )
  @IsBoolean()
  includeMeal = true;
}
