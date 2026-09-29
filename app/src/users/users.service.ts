import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { count, desc, eq } from "drizzle-orm";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import { roles, users } from "../database/schema";
import { paginated, PaginationQueryDto } from "../common/dto/pagination.dto";

type Db = ReturnType<typeof getDb>;

// Nunca expone password_hash ni refresh_token_hash.
const PUBLIC_COLUMNS = {
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  roleId: users.roleId,
  isActive: users.isActive,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const;

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  async findByEmailWithSecrets(email: string) {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return row ?? null;
  }

  async findAll(query: PaginationQueryDto) {
    const [rows, [{ value: total }]] = await Promise.all([
      this.db
        .select({ ...PUBLIC_COLUMNS, roleName: roles.name })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .orderBy(desc(users.createdAt))
        .limit(query.limit)
        .offset(query.offset),
      this.db.select({ value: count() }).from(users),
    ]);
    return paginated(rows, total, query.page, query.limit);
  }

  async findByIdPublic(id: string) {
    const [row] = await this.db
      .select({ ...PUBLIC_COLUMNS, roleName: roles.name })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, id))
      .limit(1);
    if (!row) throw new NotFoundException("Usuario no encontrado");
    return row;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    roleName?: string;
  }) {
    let roleId: string | undefined;
    if (data.roleName) {
      const [role] = await this.db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, data.roleName))
        .limit(1);
      if (!role) throw new NotFoundException(`Rol '${data.roleName}' no existe`);
      roleId = role.id;
    }
    const [row] = await this.db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId,
      })
      .returning(PUBLIC_COLUMNS);
    return row;
  }

  async roleNameById(roleId: string | null): Promise<string> {
    if (!roleId) return "CUSTOMER";
    const [row] = await this.db
      .select({ name: roles.name })
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);
    return row?.name ?? "CUSTOMER";
  }

  async setRefreshTokenHash(id: string, hash: string | null) {
    await this.db
      .update(users)
      .set({ refreshTokenHash: hash, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}
