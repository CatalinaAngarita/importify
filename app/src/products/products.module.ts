import { Module, forwardRef } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { InventoryModule } from "../inventory/inventory.module";

@Module({
  imports: [forwardRef(() => InventoryModule)],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
