import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class SilentSyncNotificationDto {
  @ApiPropertyOptional({
    description: "Hedef cihaz kimlikleri",
    example: ["device_abc_123"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  deviceIds?: string[];

  @ApiPropertyOptional({
    description: "Dogrudan FCM token listesi",
    example: ["fcm_token_value"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  fcmTokens?: string[];

  @ApiPropertyOptional({
    description: "Senkronizasyon tetikleme nedeni",
    example: "favorites-updated",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  reason?: string;

  @ApiPropertyOptional({
    description: "Degisen varlik tipi",
    example: "ayah",
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  entityType?: string;

  @ApiPropertyOptional({
    description: "Degisen varlik kimligi",
    example: "bb0211a2-6637-4faf-a9cb-510af82afd1f",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  entityId?: string;
}
