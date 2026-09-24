import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { THROTTLE_KEY, type ThrottleOptions } from "./throttle.decorator";

/**
 * Rate limiting en memoria (ventana fija por IP + handler).
 * Sin dependencias externas. Para producción multi-instancia usar Redis.
 */
const DEFAULTS: ThrottleOptions = { limit: 120, windowMs: 60_000 };

@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const opts =
      this.reflector.getAllAndOverride<ThrottleOptions>(THROTTLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULTS;
    const req = context.switchToHttp().getRequest();
    const ip =
      (req.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.ip ??
      "unknown";
    const key = `${ip}:${context.getClass().name}:${context.getHandler().name}`;
    const now = Date.now();
    const entry = this.hits.get(key);
    if (!entry || now >= entry.resetAt) {
      this.hits.set(key, { count: 1, resetAt: now + opts.windowMs });
      return true;
    }
    entry.count += 1;
    if (entry.count > opts.limit) {
      throw new HttpException("Demasiadas solicitudes, intenta más tarde", HttpStatus.TOO_MANY_REQUESTS);
    }
    // Limpieza oportunista para no crecer sin cota.
    if (this.hits.size > 10_000) {
      for (const [k, v] of this.hits) {
        if (v.resetAt <= now) this.hits.delete(k);
      }
    }
    return true;
  }
}
