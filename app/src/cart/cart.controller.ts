import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { Public } from "../auth/decorators";
import { CartService } from "./cart.service";
import { AddItemDto, CreateCartDto, UpdateItemQtyDto } from "./dto/cart.dto";

const uuid = () => new ParseUUIDPipe({ version: "4" });

@Public()
@Controller("cart")
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Post()
  create(@Body() dto: CreateCartDto) {
    return this.cart.create(dto ?? {});
  }

  @Get(":id")
  get(@Param("id", uuid()) id: string) {
    return this.cart.get(id);
  }

  @Post(":id/items")
  addItem(@Param("id", uuid()) id: string, @Body() dto: AddItemDto) {
    return this.cart.addItem(id, dto);
  }

  @Patch(":id/items/:itemId")
  updateQty(
    @Param("id", uuid()) id: string,
    @Param("itemId", uuid()) itemId: string,
    @Body() dto: UpdateItemQtyDto,
  ) {
    return this.cart.updateQuantity(id, itemId, dto.quantity);
  }

  @Delete(":id/items/:itemId")
  removeItem(@Param("id", uuid()) id: string, @Param("itemId", uuid()) itemId: string) {
    return this.cart.removeItem(id, itemId);
  }

  @Delete(":id")
  clear(@Param("id", uuid()) id: string) {
    return this.cart.clear(id);
  }
}
