import { Type } from "class-transformer";
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class CheckoutItemDto {
  @IsUUID()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CheckoutDto {
  @IsOptional()
  @IsUUID()
  cartId?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items?: CheckoutItemDto[];

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  discountCode?: string;

  @IsObject()
  shippingAddress!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  paymentMethod?: string;
}
