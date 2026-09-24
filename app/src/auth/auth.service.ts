import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

const ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? "7d";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
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
    if (!user || !user.isActive) throw new UnauthorizedException("Credenciales inválidas");
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciales inválidas");
    const role = await this.users.roleNameById(user.roleId);
    const pub = await this.users.findByIdPublic(user.id);
    return { user: pub, ...(await this.issueTokens(user.id, user.email, role)) };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; typ: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException("Refresh inválido o expirado");
    }
    if (payload.typ !== "refresh") throw new UnauthorizedException("Refresh inválido");
    const user = await this.users.findByEmailWithSecrets(
      (await this.users.findByIdPublic(payload.sub)).email,
    );
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException("Sesión cerrada");
    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException("Refresh inválido");
    const role = await this.users.roleNameById(user.roleId);
    return this.issueTokens(user.id, user.email, role);
  }

  async logout(userId: string) {
    await this.users.setRefreshTokenHash(userId, null);
    return { loggedOut: true };
  }

  private async issueTokens(id: string, email: string, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: id, email, role, typ: "access" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { expiresIn: ACCESS_TTL as any },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: id, typ: "refresh" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { expiresIn: REFRESH_TTL as any },
    );
    await this.users.setRefreshTokenHash(id, await bcrypt.hash(refreshToken, 12));
    return { accessToken, refreshToken, tokenType: "Bearer" };
  }
}
