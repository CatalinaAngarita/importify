import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import type {
  AcceptanceTokens,
  CreateTransactionInput,
  PaymentProvider,
  ProviderTransaction,
} from "./payment-provider.interface";

/**
 * Implementación Wompi Colombia según docs.wompi.co (docs Colombia):
 * - Base: sandbox https://sandbox.wompi.co/v1 | prod https://api.wompi.co/v1
 * - GET /merchants/{public_key} (público) → presigned_acceptance + personal_data_auth
 * - Firma de integridad: SHA256hex(reference + amount_in_cents + currency + integrity_secret)
 * - POST /transactions (Bearer llave privada): acceptance_token, amount_in_cents,
 *   currency (COP), customer_email, reference (única), signature, payment_method
 *   → 201, la transacción nace PENDING.
 * - GET /transactions/{id} (Bearer privada) → estado final: APPROVED | DECLINED | VOIDED | ERROR.
 */
@Injectable()
export class WompiProvider implements PaymentProvider {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;

  constructor(private readonly config: ConfigService) {
    const env = (this.config.get<string>("WOMPI_ENV") ?? "sandbox").toLowerCase();
    this.baseUrl =
      this.config.get<string>("WOMPI_BASE_URL") ??
      (env === "production" ? "https://api.wompi.co/v1" : "https://sandbox.wompi.co/v1");
    this.publicKey = this.config.get<string>("WOMPI_PUBLIC_KEY") ?? "";
    this.privateKey = this.config.get<string>("WOMPI_PRIVATE_KEY") ?? "";
    this.integritySecret = this.config.get<string>("WOMPI_INTEGRITY_SECRET") ?? "";
  }

  getName(): string {
    return "wompi";
  }

  private assertConfigured(needsPrivate = true) {
    if (!this.publicKey) {
      throw new InternalServerErrorException("WOMPI_PUBLIC_KEY no configurada");
    }
    if (needsPrivate && !this.privateKey) {
      throw new InternalServerErrorException("WOMPI_PRIVATE_KEY no configurada");
    }
    if (!this.integritySecret) {
      throw new InternalServerErrorException("WOMPI_INTEGRITY_SECRET no configurada");
    }
  }

  async getAcceptanceTokens(): Promise<AcceptanceTokens> {
    this.assertConfigured(false);
    const res = await fetch(`${this.baseUrl}/merchants/${this.publicKey}`);
    if (!res.ok) {
      throw new InternalServerErrorException(`Wompi merchants respondió ${res.status}`);
    }
    const body = (await res.json()) as {
      data?: {
        presigned_acceptance?: { acceptance_token?: string; permalink?: string };
        presigned_personal_data_auth?: { acceptance_token?: string; permalink?: string };
      };
    };
    const acceptanceToken = body.data?.presigned_acceptance?.acceptance_token;
    if (!acceptanceToken) {
      throw new InternalServerErrorException("Wompi no devolvió acceptance_token");
    }
    return {
      acceptanceToken,
      personalAuthToken: body.data?.presigned_personal_data_auth?.acceptance_token,
      termsUrl: body.data?.presigned_acceptance?.permalink,
      personalDataUrl: body.data?.presigned_personal_data_auth?.permalink,
    };
  }

  buildIntegritySignature(args: { reference: string; amountInCents: number; currency: string }): string {
    this.assertConfigured(false);
    const raw = `${args.reference}${args.amountInCents}${args.currency}${this.integritySecret}`;
    return createHash("sha256").update(raw, "utf8").digest("hex");
  }

  async createTransaction(input: CreateTransactionInput): Promise<ProviderTransaction> {
    this.assertConfigured(true);
    const res = await fetch(`${this.baseUrl}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.privateKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        acceptance_token: input.acceptanceToken,
        ...(input.personalAuthToken ? { accept_personal_auth: input.personalAuthToken } : {}),
        amount_in_cents: input.amountInCents,
        currency: input.currency,
        customer_email: input.customerEmail,
        reference: input.reference,
        signature: input.signature,
        payment_method: input.paymentMethod,
        ...(input.redirectUrl ? { redirect_url: input.redirectUrl } : {}),
        ...(input.customerData ? { customer_data: input.customerData } : {}),
        ...(input.sessionId ? { session_id: input.sessionId } : {}),
      }),
    });
    const body = (await res.json().catch(() => null)) as {
      data?: {
        id?: string;
        reference?: string;
        status?: string;
        amount_in_cents?: number;
        currency?: string;
        payment_method_type?: string;
      };
      error?: unknown;
    } | null;
    if (!res.ok || !body?.data?.id) {
      throw new InternalServerErrorException(
        `Wompi no creó la transacción (${res.status}): ${JSON.stringify(body?.error ?? body)}`,
      );
    }
    const d = body.data;
    return {
      id: d.id!,
      reference: d.reference ?? input.reference,
      status: d.status ?? "PENDING",
      amountInCents: d.amount_in_cents ?? input.amountInCents,
      currency: d.currency,
      paymentMethodType: d.payment_method_type,
      raw: body,
    };
  }

  async getTransaction(id: string): Promise<ProviderTransaction> {
    this.assertConfigured(true);
    const res = await fetch(`${this.baseUrl}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${this.privateKey}` },
    });
    if (!res.ok) {
      throw new InternalServerErrorException(`Wompi transactions/${id} respondió ${res.status}`);
    }
    const body = (await res.json()) as {
      data?: {
        id?: string;
        reference?: string;
        status?: string;
        amount_in_cents?: number;
        currency?: string;
        payment_method_type?: string;
      };
    };
    const d = body.data ?? {};
    return {
      id: d.id ?? id,
      reference: d.reference ?? "",
      status: d.status ?? "PENDING",
      amountInCents: d.amount_in_cents ?? 0,
      currency: d.currency,
      paymentMethodType: d.payment_method_type,
      raw: body,
    };
  }
}
