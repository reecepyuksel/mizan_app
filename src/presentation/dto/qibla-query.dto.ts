import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsLatitude, IsLongitude } from "class-validator";

export class QiblaQueryDto {
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
}
