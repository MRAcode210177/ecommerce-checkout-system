import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';
import { QueryProductsDto } from '../dto/query-products.dto';
import { CreateProductDto } from '../dto/create-product.dto';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: QueryProductsDto): Promise<[Product[], number]> {
    const { page = 1, limit = 10, search, category } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category.trim() !== '') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return [items, total];
  }

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: data.category,
        imageUrl: data.imageUrl,
      },
    });
  }

  // Row-level lock fetch inside a transaction for a single product
  async findByIdForUpdateTx(tx: Prisma.TransactionClient, id: string): Promise<{ id: string; stock: number; price: Prisma.Decimal; name: string } | null> {
    const result = await tx.$queryRaw<{ id: string; stock: number; price: any; name: string }[]>`
      SELECT "id", "stock", "price", "name" FROM "Product" WHERE "id" = ${id} FOR UPDATE
    `;
    return result.length > 0 ? result[0] : null;
  }

  // Row-level lock fetch inside a transaction for multiple products (batch lock in 1 roundtrip)
  async findManyByIdsForUpdateTx(tx: Prisma.TransactionClient, ids: string[]): Promise<{ id: string; stock: number; price: Prisma.Decimal; name: string }[]> {
    if (ids.length === 0) return [];
    return tx.$queryRaw<{ id: string; stock: number; price: any; name: string }[]>`
      SELECT "id", "stock", "price", "name" FROM "Product" WHERE "id" IN (${Prisma.join(ids)}) ORDER BY "id" ASC FOR UPDATE
    `;
  }

  async decrementStockTx(tx: Prisma.TransactionClient, id: string, quantity: number): Promise<void> {
    await tx.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  async incrementStockTx(tx: Prisma.TransactionClient, id: string, quantity: number): Promise<void> {
    await tx.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }
}
