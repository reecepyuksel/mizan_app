import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class SearchQueryDto {
  @IsString()
  q!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
