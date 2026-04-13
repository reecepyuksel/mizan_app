import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class SirahListQueryDto {
  @ApiPropertyOptional({
    description: "Filtre: bolum basligi",
    example: "MEKKE DEVRİ",
  })
  @IsOptional()
  @IsString()
  partTitle?: string;

  @ApiPropertyOptional({
    description: "Filtre: unite numarasi",
    example: "IV",
  })
  @IsOptional()
  @IsString()
  unitNumber?: string;

  @ApiPropertyOptional({
    description: "Sayfa numarasi",
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: "Sayfa basi kayit",
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
