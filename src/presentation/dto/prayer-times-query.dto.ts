import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsOptional,
} from "class-validator";

export class PrayerTimesQueryDto {
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
    description: "Tarih (YYYY-MM-DD). Bos birakilirsa bugun",
    example: "2026-04-09",
  })
  @IsOptional()
  @IsDateString({ strict: true })
  date?: string;
}
