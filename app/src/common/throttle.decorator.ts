import { SetMetadata } from "@nestjs/common";

export interface ThrottleOptions {
  limit: number;
  windowMs: number;
}

export const THROTTLE_KEY = "throttle";
/** Límite por IP y endpoint. Sin decorador: se aplica el global (ver ThrottleGuard). */
export const Throttle = (limit: number, windowMs = 60_000) =>
  SetMetadata(THROTTLE_KEY, { limit, windowMs } satisfies ThrottleOptions);
