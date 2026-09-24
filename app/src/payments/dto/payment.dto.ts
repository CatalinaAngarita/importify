import { Type } from "class-transformer";
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class CreatePaymentIntentDto {
  @IsUUID()
  orderId!: string;

  @IsEmail()
  customerEmail!: string;

  // Método de pago Wompi tal cual lo documenta /metodos-de-pago
  // (p. ej. { type: "CARD", token, installments }). Si se omite, se devuelve
  // la firma + acceptance para que appweb complete con el Widget.
  @IsOptional()
  @IsObject()
  paymentMethod?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  redirectUrl?: string;

  @IsOptional()
  @IsObject()
  customerData?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
