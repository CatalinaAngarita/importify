import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { EmailService } from "./email.service";

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}
