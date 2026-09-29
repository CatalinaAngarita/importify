import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators";
import { RolesGuard } from "../auth/roles.guard";
import { AdminService } from "./admin.service";

@UseGuards(RolesGuard)
@Roles("ADMIN")
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.stats();
  }
}
