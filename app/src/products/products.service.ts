import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  type SQL,
} from "drizzle-orm";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import { categories, products } from "../database/schema";
import { InventoryService } from "../inventory/inventory.service";
import { paginated } from "../common/dto/pagination.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";

type Db = ReturnType<typeof getDb>;

const SORTABLE = {
  name: products.name,
  price: products.price,
  stock: products.stock,
  createdAt: products.createdAt,
} as const;

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE) private readonly db: Db,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventory: InventoryService,
  ) {}

  async findAll(query: ProductQueryDto) {
    const filters: SQL[] = [];
    if (query.q) {
      const q = `%${query.q}%`;
      filters.push(
        or(
          ilike(products.name, q),
          ilike(products.sku, q),
          ilike(products.slug, q),
        )!,
      );
    }
    if (query.categoryId) filters.push(eq(products.categoryId, query.categoryId));
    if (query.isActive !== undefined) filters.push(eq(products.isActive, query.isActive));
    if (query.isFeatured !== undefined) filters.push(eq(products.isFeatured, query.isFeatured));
    if (query.isBestSeller !== undefined) filters.push(eq(products.isBestSeller, query.isBestSeller));
    if (query.minPrice !== undefined) filters.push(gte(products.price, String(query.minPrice)));
    if (query.maxPrice !== undefined) filters.push(lte(products.price, String(query.maxPrice)));

    const sortCol =
      SORTABLE[query.sort as keyof typeof SORTABLE] ?? products.createdAt;
    const orderBy = query.order === "asc" ? asc(sortCol) : desc(sortCol);
    const where = filters.length ? and(...filters) : undefined;

    // categorySlug requiere join; se resuelve a categoryId antes de filtrar.
    let categoryId = query.categoryId;
    if (!categoryId && query.categorySlug) {
      const [cat] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, query.categorySlug))
        .limit(1);
      if (!cat) return paginated([], 0, query.page, query.limit);
      categoryId = cat.id;
      filters.push(eq(products.categoryId, categoryId));
    }
    const finalWhere = filters.length ? and(...filters) : undefined;

    const [rows, [{ value: total }]] = await Promise.all([
      this.db
        .select({
          id: products.id,
          sku: products.sku,
          name: products.name,
          slug: products.slug,
          shortDescription: products.shortDescription,
          price: products.price,
          compareAtPrice: products.compareAtPrice,
          stock: products.stock,
          categoryId: products.categoryId,
          categoryName: categories.name,
          categorySlug: categories.slug,
          isActive: products.isActive,
          isFeatured: products.isFeatured,
          isBestSeller: products.isBestSeller,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(finalWhere ?? where)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(query.offset),
      this.db.select({ value: count() }).from(products).where(finalWhere ?? where),
    ]);
    return paginated(rows, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const [row] = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!row) throw new NotFoundException(`Producto ${id} no encontrado`);
    return row;
  }

  async findBySlug(slug: string) {
    const [row] = await this.db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!row) throw new NotFoundException(`Producto '${slug}' no encontrado`);
    return row;
  }

  async create(dto: CreateProductDto) {
    await this.assertSkuUnique(dto.sku);
    await this.assertSlugUnique(dto.slug);
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);
    const [row] = await this.db
      .insert(products)
      .values({ ...dto, price: String(dto.price), compareAtPrice: dto.compareAtPrice !== undefined ? String(dto.compareAtPrice) : undefined })
      .returning();
    return row;
  }

  async update(id: string, dto: UpdateProductDto) {
    const current = await this.findOne(id);
    if (dto.sku) await this.assertSkuUnique(dto.sku, id);
    if (dto.slug) await this.assertSlugUnique(dto.slug, id);
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);
    // Toda modificación de stock pasa por InventoryService (registra movimiento en transacción).
    if (dto.stock !== undefined && dto.stock !== current.stock) {
      const { product } = await this.inventory.adjustStock(id, dto.stock, {
        reason: "Actualización desde ProductsService.update",
      });
      const { stock: _ignored, ...rest } = dto;
      if (Object.keys(rest).length === 0) return product;
      const [row] = await this.db
        .update(products)
        .set({
          ...rest,
          price: rest.price !== undefined ? String(rest.price) : undefined,
          compareAtPrice: rest.compareAtPrice !== undefined ? String(rest.compareAtPrice) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();
      return row;
    }
    const [row] = await this.db
      .update(products)
      .set({
        ...dto,
        price: dto.price !== undefined ? String(dto.price) : undefined,
        compareAtPrice: dto.compareAtPrice !== undefined ? String(dto.compareAtPrice) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return row;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(products).where(eq(products.id, id));
    return { deleted: true, id };
  }

  private async assertSkuUnique(sku: string, exceptId?: string) {
    const [row] = await this.db.select({ id: products.id }).from(products).where(eq(products.sku, sku)).limit(1);
    if (row && row.id !== exceptId) throw new ConflictException(`SKU '${sku}' ya existe`);
  }

  private async assertSlugUnique(slug: string, exceptId?: string) {
    const [row] = await this.db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (row && row.id !== exceptId) throw new ConflictException(`Slug '${slug}' ya existe`);
  }

  private async assertCategoryExists(categoryId: string) {
    const [row] = await this.db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1);
    if (!row) throw new NotFoundException(`Categoría ${categoryId} no encontrada`);
  }
}
