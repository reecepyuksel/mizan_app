import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class RegisterNotificationDeviceDto {
  @ApiProperty({
    description: "Cihaz benzersiz kimligi",
    example: "device_abc_123",
  })
  @IsString()
  @MaxLength(120)
  deviceId!: string;

  @ApiProperty({
    description: "Firebase Cloud Messaging tokeni",
    example: "fcm_token_value",
  })
  @IsString()
  @MaxLength(255)
  fcmToken!: string;

  @ApiProperty({
    description: "Cihaz platformu",
    example: "android",
    enum: ["android", "ios", "web"],
  })
  @IsString()
  @IsIn(["android", "ios", "web"])
  platform!: "android" | "ios" | "web";

  @ApiPropertyOptional({
    description: "Uygulama dili",
    example: "tr",
  })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string;

  @ApiPropertyOptional({
    description: "Cihaz timezone bilgisi",
    example: "Europe/Istanbul",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional({
    description: "Uygulama surumu",
    example: "1.4.0",
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  appVersion?: string;
}
