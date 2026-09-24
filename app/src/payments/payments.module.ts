import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PAYMENT_PROVIDER } from "./providers/payment-provider.interface";
import { WompiProvider } from "./providers/wompi.provider";

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    WompiProvider,
    { provide: PAYMENT_PROVIDER, useExisting: WompiProvider },
  ],
  exports: [PaymentsService, PAYMENT_PROVIDER],
})
export class PaymentsModule {}
