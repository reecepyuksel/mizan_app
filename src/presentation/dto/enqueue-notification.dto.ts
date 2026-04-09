import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class EnqueueNotificationDto {
  @ApiProperty({
    description: "Bildirim tipi",
    example: "visible",
    enum: ["visible", "silent-sync"],
  })
  @IsString()
  @IsIn(["visible", "silent-sync"])
  type!: "visible" | "silent-sync";

  @ApiPropertyOptional({
    description: "Bildirim basligi",
    example: "Yeni icerik hazir",
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    description: "Bildirim govdesi",
    example: "Bugunun tavsiye edilen icerigini acabilirsiniz.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  body?: string;

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
    description: "Bildirimle gidecek string anahtar-deger verisi",
    example: {
      screen: "daily-prayer-times",
      contentId: "abc123",
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
