import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class AdjustStockDto {
  @IsInt()
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;
}
