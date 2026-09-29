import { apiGet, apiPost } from "./api";

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
    return apiPost<{ payment: { id: string }; wompi: unknown }>("/payments/intent", data);
  },
  status(id: string) {
    return apiGet<{ payment: { status: string } }>(`/payments/${id}/status`);
  },
};
