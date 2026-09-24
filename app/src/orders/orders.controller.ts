import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Public, Roles } from "../auth/decorators";
import { resolveOptionalUserId } from "../auth/optional-auth";
import { RolesGuard } from "../auth/roles.guard";
import { OrdersService } from "./orders.service";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/order.dto";
import { PaginationQueryDto } from "../common/dto/pagination.dto";

const uuid = () => new ParseUUIDPipe({ version: "4" });

@Controller("orders")
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly jwt: JwtService,
  ) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.orders.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", uuid()) id: string) {
    return this.orders.findOne(id);
  }

  @Public()
  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: never) {
    const authed = await resolveOptionalUserId(req as never, this.jwt);
    return this.orders.create({ ...dto, userId: authed ?? dto.userId });
  }

  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @Patch(":id/status")
  updateStatus(@Param("id", uuid()) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }
}
