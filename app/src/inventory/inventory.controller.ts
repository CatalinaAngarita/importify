import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../auth/decorators";
import { RolesGuard } from "../auth/roles.guard";
import { InventoryService } from "./inventory.service";
import { AdjustStockDto } from "./dto/adjust-stock.dto";
import { InventoryQueryDto } from "./dto/inventory-query.dto";

@UseGuards(RolesGuard)
@Roles("ADMIN")
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get("movements")
  history(@Query() query: InventoryQueryDto) {
    return this.inventory.history(query);
  }

  @Post("products/:id/increase")
  increase(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventory.increaseStock(id, { ...dto });
  }

  @Post("products/:id/decrease")
  decrease(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventory.decreaseStock(id, { ...dto });
  }

  @Patch("products/:id/adjust")
  adjust(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventory.adjustStock(id, dto.quantity, {
      reason: dto.reason,
      reference: dto.reference,
    });
  }
}
