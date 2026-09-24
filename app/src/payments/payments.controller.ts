import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post, Req, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Public } from "../auth/decorators";
import { resolveOptionalUserId } from "../auth/optional-auth";
import { Throttle } from "../common/throttle.decorator";
import { PaymentsService } from "./payments.service";
import { CreatePaymentIntentDto } from "./dto/payment.dto";

@Public()
@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly jwt: JwtService,
  ) {}

  /** Llave pública + acceptance tokens para el Widget (sin secretos). */
  @Get("public-config")
  publicConfig() {
    return this.payments.getPublicConfig();
  }

  @Throttle(30)
  @Post("intent")
  async intent(@Body() dto: CreatePaymentIntentDto, @Req() req: never) {
    return this.payments.createIntent(dto, await resolveOptionalUserId(req as never, this.jwt));
  }

  /** Re-verifica el estado contra Wompi. El frontend no decide el resultado. */
  @Get(":id/status")
  status(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.payments.syncStatus(id);
  }

  @Get("by-order/:orderId")
  byOrder(@Param("orderId", new ParseUUIDPipe({ version: "4" })) orderId: string) {
    return this.payments.findByOrder(orderId);
  }

  /** Webhook Wompi (evento transaction.updated). Configurar URL en el dashboard. */
  @Throttle(120)
  @Post("webhook")
  webhook(@Body() body: Record<string, never>, @Headers("x-event-checksum") checksum?: string) {
    return this.payments.handleWebhook(body as never, checksum);
  }
}
