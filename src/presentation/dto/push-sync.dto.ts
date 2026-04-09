import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString } from "class-validator";

export class PushSyncDto {
  @ApiProperty({
    description: "Cihaz benzersiz kimligi",
    example: "device_abc_123",
  })
  @IsString()
  deviceId!: string;

  @ApiProperty({
    description: "WatermelonDB degisim paketi",
    example: {
      user_favorites: {
        created: [],
        updated: [],
        deleted: [],
      },
      user_notes: {
        created: [],
        updated: [],
        deleted: [],
      },
    },
  })
  @IsObject()
  changes!: Record<string, unknown>;
}
