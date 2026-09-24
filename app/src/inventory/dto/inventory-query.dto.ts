import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination.dto";
import type { InventoryMovementType } from "../../database/schema";

export class InventoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsEnum(["PURCHASE", "SALE", "RETURN", "ADJUSTMENT", "CANCELLATION"] as const)
  movementType?: InventoryMovementType;
}
