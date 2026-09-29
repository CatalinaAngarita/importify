import { JwtService } from "@nestjs/jwt";

/**
 * Auth opcional para endpoints públicos con invitado + logueado
 * (checkout, crear pedido, intento de pago). Si hay Bearer válido devuelve
 * el userId; si no, null. El userId del token prevalece sobre el del body
 * (evita suplantación de userId).
 */
export async function resolveOptionalUserId(
  req: { headers?: Record<string, string | string[] | undefined> },
  jwt: JwtService,
): Promise<string | null> {
  const header = req.headers?.authorization;
  const value = Array.isArray(header) ? header[0] : header;
  const [scheme, token] = (value ?? "").split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    const payload = await jwt.verifyAsync(token);
    if (payload.typ !== "access" || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}
