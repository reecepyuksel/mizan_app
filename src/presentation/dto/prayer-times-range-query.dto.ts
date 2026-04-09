import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  Max,
  Min,
} from "class-validator";

export class PrayerTimesRangeQueryDto {
  @ApiProperty({
    description: "Enlem (latitude)",
    example: 41.0082,
  })
  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @ApiProperty({
    description: "Boylam (longitude)",
    example: 28.9784,
  })
  @Type(() => Number)
  @IsLongitude()
  lon!: number;

  @ApiPropertyOptional({
    description: "Baslangic tarihi (YYYY-MM-DD). Bos ise bugun",
    example: "2026-04-09",
  })
  @IsOptional()
  @IsDateString({ strict: true })
  startDate?: string;

  @ApiPropertyOptional({
    description: "Kac gunluk vakit donsun (1-30)",
    default: 7,
    minimum: 1,
    maximum: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  days = 7;
}
