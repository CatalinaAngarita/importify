import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import { categories } from "../database/schema";
import { paginated } from "../common/dto/pagination.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryQueryDto } from "./dto/category-query.dto";

type Db = ReturnType<typeof getDb>;
const SORTABLE = ["name", "slug", "createdAt"] as const;

@Injectable()
export class CategoriesService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  async findAll(query: CategoryQueryDto) {
    const filters: SQL[] = [];
    if (query.q) {
      const q = `%${query.q}%`;
      filters.push(or(ilike(categories.name, q), ilike(categories.slug, q))!);
    }
    if (query.isActive !== undefined) filters.push(eq(categories.isActive, query.isActive));

    const sortKey = SORTABLE.includes(query.sort as (typeof SORTABLE)[number])
      ? (query.sort as (typeof SORTABLE)[number])
      : "createdAt";
    const sortCol = sortKey === "name" ? categories.name : sortKey === "slug" ? categories.slug : categories.createdAt;
    const orderBy = query.order === "asc" ? asc(sortCol) : desc(sortCol);

    const where = filters.length ? and(...filters) : undefined;
    const [rows, [{ value: total }]] = await Promise.all([
      this.db.select().from(categories).where(where).orderBy(orderBy).limit(query.limit).offset(query.offset),
      this.db.select({ value: count() }).from(categories).where(where),
    ]);
    return paginated(rows, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const [row] = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!row) throw new NotFoundException(`Categoría ${id} no encontrada`);
    return row;
  }

  async create(dto: CreateCategoryDto) {
    await this.assertSlugUnique(dto.slug);
    const [row] = await this.db.insert(categories).values(dto).returning();
    return row;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    if (dto.slug) await this.assertSlugUnique(dto.slug, id);
    const [row] = await this.db.update(categories).set({ ...dto, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
    return row;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(categories).where(eq(categories.id, id));
    return { deleted: true, id };
  }

  private async assertSlugUnique(slug: string, exceptId?: string) {
    const [row] = await this.db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
    if (row && row.id !== exceptId) throw new ConflictException(`Slug '${slug}' ya existe`);
  }
}
