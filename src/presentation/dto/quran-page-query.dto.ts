import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, Max, Min } from "class-validator";

export class QuranPageQueryDto {
  @ApiPropertyOptional({
    description: "Mushaf sayfa numarasi (1-604)",
    default: 1,
    minimum: 1,
    maximum: 604,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(604)
  page = 1;

  @ApiPropertyOptional({
    description: "Ayni sayfada Turkce meal goster",
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? value.toLowerCase() === "true" : Boolean(value),
  )
  @IsBoolean()
  includeMeal = false;
}
