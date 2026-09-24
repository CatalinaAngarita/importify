/**
 * Abstracción de pasarela de pago. El dominio (PaymentsService) solo depende
 * de esta interfaz; WompiProvider es la implementación para Wompi Colombia.
 */
export interface AcceptanceTokens {
  acceptanceToken: string;
  personalAuthToken?: string;
  termsUrl?: string;
  personalDataUrl?: string;
}

export interface CreateTransactionInput {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  acceptanceToken: string;
  personalAuthToken?: string;
  signature: string;
  paymentMethod: Record<string, unknown>;
  redirectUrl?: string;
  customerData?: Record<string, unknown>;
  sessionId?: string;
}

export interface ProviderTransaction {
  id: string;
  reference: string;
  status: string;
  amountInCents: number;
  currency?: string;
  paymentMethodType?: string;
  raw: unknown;
}

export const PAYMENT_PROVIDER = "PAYMENT_PROVIDER";

export interface PaymentProvider {
  getName(): string;
  getAcceptanceTokens(): Promise<AcceptanceTokens>;
  buildIntegritySignature(args: {
    reference: string;
    amountInCents: number;
    currency: string;
  }): string;
  createTransaction(input: CreateTransactionInput): Promise<ProviderTransaction>;
  getTransaction(id: string): Promise<ProviderTransaction>;
}
