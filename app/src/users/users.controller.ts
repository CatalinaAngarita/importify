import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators";
import { RolesGuard } from "../auth/roles.guard";
import { UsersService } from "./users.service";
import { PaginationQueryDto } from "../common/dto/pagination.dto";

@UseGuards(RolesGuard)
@Roles("ADMIN")
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.users.findAll(query);
  }
}
