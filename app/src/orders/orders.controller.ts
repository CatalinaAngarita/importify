import {
  Body,
  Controller,
  ForbiddenException,
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
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { OrdersService } from "./orders.service";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/order.dto";
import { PaginationQueryDto } from "../common/dto/pagination.dto";

const uuid = () => new ParseUUIDPipe({ version: "4" });

type RequestUser = { id: string; email?: string; role?: string };

function isAdmin(user: RequestUser): boolean {
  return user.role === "ADMIN" || user.role === "SUPERADMIN";
}

@UseGuards(JwtAuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly jwt: JwtService,
  ) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto, @Req() req: { user: RequestUser }) {
    const scoped = Object.assign(query, {
      userId: isAdmin(req.user) ? undefined : req.user.id,
    });
    return this.orders.findAll(scoped);
  }

  @Get(":id")
  async findOne(@Param("id", uuid()) id: string, @Req() req: { user: RequestUser }) {
    const order = await this.orders.findOne(id);
    if (!isAdmin(req.user) && order.userId !== req.user.id) {
      throw new ForbiddenException("Este pedido pertenece a otro usuario");
    }
    return order;
  }

  @Public()
  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: never) {
    const authed = await resolveOptionalUserId(req as never, this.jwt);
    return this.orders.create({ ...dto, userId: authed ?? dto.userId });
  }

  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPERADMIN")
  @Patch(":id/status")
  updateStatus(@Param("id", uuid()) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto.status);
  }
}
