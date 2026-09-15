import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductRepository } from '../products/repositories/product.repository';
import { OrderRepository } from '../orders/repositories/order.repository';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import {
  InsufficientStockException,
  ResourceNotFoundException,
} from '../common/exceptions/domain.exception';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async checkout(userId: string, dto: CreateCheckoutDto) {
    // Check idempotency key if provided
    if (dto.idempotencyKey) {
      const existingOrder = await this.orderRepository.findByIdempotencyKey(dto.idempotencyKey);
      if (existingOrder) {
        return this.formatOrderResponse(existingOrder);
      }
    }

    // Execute atomic checkout transaction with extended timeout for cloud databases (30s timeout)
    const createdOrder = await this.prisma.$transaction(
      async (tx) => {
        // Sort items by productId to prevent potential database deadlocks in concurrent multi-item transactions
        const sortedItems = [...dto.items].sort((a, b) => a.productId.localeCompare(b.productId));
        const productIds = sortedItems.map((i) => i.productId);

        // Step 1: Batch Row-level lock (SELECT ... WHERE id IN (...) ORDER BY id FOR UPDATE) in 1 round-trip
        const lockedProducts = await this.productRepository.findManyByIdsForUpdateTx(tx, productIds);
        const productMap = new Map(lockedProducts.map((p) => [p.id, p]));

        const orderItemPayloads: { productId: string; quantity: number; priceAtPurchase: number }[] = [];
        let calculatedTotal = 0;

        for (const item of sortedItems) {
          const lockedProduct = productMap.get(item.productId);

          if (!lockedProduct) {
            throw new ResourceNotFoundException('Product', item.productId);
          }

          // Step 2: Stock validation
          if (lockedProduct.stock < item.quantity) {
            throw new InsufficientStockException(
              item.productId,
              lockedProduct.name,
              item.quantity,
              lockedProduct.stock,
            );
          }

          const unitPrice = Number(lockedProduct.price);
          calculatedTotal += unitPrice * item.quantity;

          orderItemPayloads.push({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: unitPrice,
          });

          // Step 3: Decrement stock
          await this.productRepository.decrementStockTx(tx, item.productId, item.quantity);
        }

        // Step 4: Create Order with price snapshots
        const order = await this.orderRepository.createOrderTx(
          tx,
          userId,
          orderItemPayloads,
          Math.round(calculatedTotal * 100) / 100,
          dto.idempotencyKey,
        );

        return order;
      },
      {
        maxWait: 15000, // Maximum time Prisma Client waits to get a connection from the pool (15s)
        timeout: 30000, // Maximum time the interactive transaction can run (30s for remote cloud DBs)
      },
    );

    return this.formatOrderResponse(createdOrder);
  }

  private formatOrderResponse(order: any) {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      idempotencyKey: order.idempotencyKey,
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase),
        product: item.product
          ? {
              ...item.product,
              price: Number(item.product.price),
              createdAt: item.product.createdAt ? item.product.createdAt.toISOString() : undefined,
              updatedAt: item.product.updatedAt ? item.product.updatedAt.toISOString() : undefined,
            }
          : undefined,
      })),
      payments: (order.payments || []).map((p: any) => ({
        ...p,
        amount: Number(p.amount),
        createdAt: p.createdAt.toISOString(),
      })),
      refunds: (order.refunds || []).map((r: any) => ({
        ...r,
        amount: Number(r.amount),
        createdAt: r.createdAt.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
