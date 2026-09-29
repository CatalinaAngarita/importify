import { Body, Controller, Post, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Public } from "../auth/decorators";
import { resolveOptionalUserId } from "../auth/optional-auth";
import { CheckoutService } from "./checkout.service";
import { CheckoutDto } from "./dto/checkout.dto";

@Public()
@Controller("checkout")
export class CheckoutController {
  constructor(
    private readonly checkout: CheckoutService,
    private readonly jwt: JwtService,
  ) {}

  @Post()
  async run(@Body() dto: CheckoutDto, @Req() req: never) {
    // El userId del token prevalece: evita suplantación desde appweb.
    const authed = await resolveOptionalUserId(req as never, this.jwt);
    return this.checkout.checkout({ ...dto, userId: authed ?? dto.userId });
  }
}
