import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProductsService } from "./products.service";
import { Public, Roles } from "../auth/decorators";
import { RolesGuard } from "../auth/roles.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { getUploadsDir } from "../common/uploads";

@Controller("products")
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.service.findAll(query);
  }

  @Public()
  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.service.findBySlug(slug);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPERADMIN")
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPERADMIN")
  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPERADMIN")
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPERADMIN")
  @Post(":id/images")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = join(getUploadsDir(), "products");
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error("Solo se permiten imágenes (jpg, jpeg, png, webp)"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error("No se subió ningún archivo");
    const imageUrl = `/uploads/products/${file.filename}`;
    return this.service.addImage(id, imageUrl, file.originalname, true);
  }

  @Public()
  @Get(":id/images")
  async getImages(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.getImages(id);
  }

  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPERADMIN")
  @Delete(":id/images/:imageId")
  async removeImage(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("imageId", ParseUUIDPipe) imageId: string,
  ) {
    return this.service.removeImage(id, imageId);
  }

  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPERADMIN")
  @Patch(":id/images/:imageId/primary")
  async setPrimaryImage(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("imageId", ParseUUIDPipe) imageId: string,
  ) {
    return this.service.setPrimaryImage(id, imageId);
  }
}
