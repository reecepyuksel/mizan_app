import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class PullSyncQueryDto {
  @ApiProperty({
    description: "Cihaz benzersiz kimligi",
    example: "device_abc_123",
  })
  @IsString()
  deviceId!: string;

  @ApiPropertyOptional({
    description: "Son pull zamani (epoch ms)",
    example: 1712659200000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lastPulledAt?: number;
}
