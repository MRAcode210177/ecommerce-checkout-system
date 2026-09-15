import { Injectable } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ResourceNotFoundException } from '../common/exceptions/domain.exception';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(query: QueryProductsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const [items, total] = await this.productRepository.findMany(query);

    return {
      items: items.map((p) => ({
        ...p,
        price: Number(p.price),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ResourceNotFoundException('Product', id);
    }

    return {
      ...product,
      price: Number(product.price),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  async createProduct(dto: CreateProductDto) {
    const product = await this.productRepository.create(dto);
    return {
      ...product,
      price: Number(product.price),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
