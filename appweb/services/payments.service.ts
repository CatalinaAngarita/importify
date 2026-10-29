import { apiGet, apiPost } from "./api";

export type WompiIntentResponse = {
  payment: { id: string };
  wompi: {
    publicKey: string;
    reference: string;
    amountInCents: number;
    signature: string;
  };
};

export type WompiStatusResponse = {
  payment: {
    id: string;
    status: string;
    amountCents: number;
    reference: string;
  };
  order: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
  };
  wompiTransaction: {
    id: string;
    status: string;
  };
};

export const paymentsService = {
  publicConfig() {
    return apiGet<{
      provider: string;
      publicKey: string | null;
      acceptanceToken: string;
      personalAuthToken?: string;
    }>("/payments/public-config");
  },
  intent(data: { orderId: string; customerEmail: string; paymentMethod?: Record<string, unknown> }) {
    return apiPost<WompiIntentResponse>("/payments/intent", data, true);
  },
  status(id: string) {
    return apiGet<{ payment: { status: string } }>(`/payments/${id}/status`);
  },
  wompiStatus(transactionId: string) {
    return apiGet<WompiStatusResponse>(`/payments/wompi-status/${encodeURIComponent(transactionId)}`);
  },
};
