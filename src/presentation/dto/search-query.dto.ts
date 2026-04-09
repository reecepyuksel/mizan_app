import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SearchQueryDto {
  @ApiProperty({
    description: "Aranacak metin",
    example: "rahmet",
  })
  @IsString()
  q!: string;

  @ApiPropertyOptional({
    description: "Sonuc limiti (1-100)",
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
