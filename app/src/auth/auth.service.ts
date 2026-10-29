import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { createHash } from "crypto";
import { UsersService } from "../users/users.service";
import { EmailService } from "./email.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import { authOtps } from "../database/schema";
import { eq } from "drizzle-orm";

const ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? "7d";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    @Inject(DATABASE) private readonly db: ReturnType<typeof getDb>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmailWithSecrets(dto.email);
    if (existing) throw new ConflictException("Correo ya registrado");
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roleName: "CUSTOMER",
    });
    const tokens = await this.issueTokens(user.id, user.email, "CUSTOMER");
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithSecrets(dto.email);
    if (!user || !user.isActive) throw new UnauthorizedException("Credenciales invalidas");
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciales invalidas");
    const role = await this.users.roleNameById(user.roleId);
    const pub = await this.users.findByIdPublic(user.id);
    return { user: pub, ...(await this.issueTokens(user.id, user.email, role)) };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; typ: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException("Refresh invalido o expirado");
    }
    if (payload.typ !== "refresh") throw new UnauthorizedException("Refresh invalido");
    const user = await this.users.findByEmailWithSecrets(
      (await this.users.findByIdPublic(payload.sub)).email,
    );
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException("Sesion cerrada");
    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException("Refresh invalido");
    const role = await this.users.roleNameById(user.roleId);
    return this.issueTokens(user.id, user.email, role);
  }

  async logout(userId: string) {
    await this.users.setRefreshTokenHash(userId, null);
    return { loggedOut: true };
  }

  async sendOtp(email: string) {
    const normalized = this.normalizeEmail(email);
    const user = await this.users.findByEmailWithSecrets(normalized);
    const role = user ? await this.users.roleNameById(user.roleId) : null;
    if (!user || !user.isActive || !this.isAdminRole(role)) {
      throw new UnauthorizedException("No autorizado para acceder al panel");
    }
    if (!this.email.isConfigured()) {
      throw new ServiceUnavailableException("SMTP no configurado");
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = 600;
    const codeHash = createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    await this.db.delete(authOtps).where(eq(authOtps.email, normalized));
    await this.db.insert(authOtps).values({
      email: normalized,
      codeHash,
      expiresAt,
      attempts: 0,
    });
    try {
      await this.email.sendOtpEmail(normalized, code);
    } catch (err) {
      await this.db.delete(authOtps).where(eq(authOtps.email, normalized));
      this.logger.error(`Error enviando OTP a ${normalized}`, err);
      throw new ServiceUnavailableException("No se pudo enviar el correo");
    }
    return {
      success: true,
      message: "Codigo enviado a tu correo",
      expiresIn,
    };
  }

  async verifyOtp(email: string, code: string) {
    const normalized = this.normalizeEmail(email);
    const [stored] = await this.db
      .select()
      .from(authOtps)
      .where(eq(authOtps.email, normalized))
      .limit(1);
    if (!stored) {
      throw new UnauthorizedException("Codigo invalido o expirado");
    }
    if (Date.now() > stored.expiresAt.getTime()) {
      await this.db.delete(authOtps).where(eq(authOtps.email, normalized));
      throw new UnauthorizedException("Codigo expirado");
    }
    const attempts = (stored.attempts ?? 0) + 1;
    await this.db
      .update(authOtps)
      .set({ attempts })
      .where(eq(authOtps.email, normalized));
    if (attempts > 5) {
      await this.db.delete(authOtps).where(eq(authOtps.email, normalized));
      throw new UnauthorizedException("Demasiados intentos, solicita un nuevo codigo");
    }
    const codeHash = createHash("sha256").update(code).digest("hex");
    if (stored.codeHash !== codeHash) {
      throw new UnauthorizedException("Codigo invalido");
    }
    await this.db.delete(authOtps).where(eq(authOtps.email, normalized));
    const user = await this.users.findByEmailWithSecrets(normalized);
    const role = user ? await this.users.roleNameById(user.roleId) : null;
    if (!user || !user.isActive || !this.isAdminRole(role)) {
      throw new UnauthorizedException("No autorizado para acceder al panel");
    }
    const pub = await this.users.findByIdPublic(user.id);
    const tokens = await this.issueTokens(user.id, user.email, role as string);
    return { user: pub, ...tokens };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isAdminRole(role: string | null): boolean {
    return role === "ADMIN" || role === "SUPERADMIN";
  }

  private async issueTokens(id: string, email: string, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: id, email, role, typ: "access" },
      { expiresIn: ACCESS_TTL as any },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: id, typ: "refresh" },
      { expiresIn: REFRESH_TTL as any },
    );
    await this.users.setRefreshTokenHash(id, await bcrypt.hash(refreshToken, 12));
    return { accessToken, refreshToken, tokenType: "Bearer" };
  }
}
