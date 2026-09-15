import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { QueryOrdersDto } from '../dto/query-orders.dto';

export interface OrderItemCreateData {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderTx(
    tx: Prisma.TransactionClient,
    userId: string,
    items: OrderItemCreateData[],
    totalAmount: number,
    idempotencyKey?: string,
  ): Promise<Order & { items: any[] }> {
    return tx.order.create({
      data: {
        userId,
        status: OrderStatus.RESERVED,
        totalAmount,
        idempotencyKey,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        refunds: true,
      },
    });
  }

  async findByIdempotencyKey(key: string) {
    return this.prisma.order.findUnique({
      where: { idempotencyKey: key },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        refunds: true,
      },
    });
  }

  async findUserOrders(userId: string, query: QueryOrdersDto): Promise<[any[], number]> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
          refunds: true,
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return [items, total];
  }

  async findAllOrders(query: QueryOrdersDto): Promise<[any[], number]> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
          refunds: true,
        },
      }),
      this.prisma.order.count(),
    ]);

    return [items, total];
  }

  async updateStatusTx(
    tx: Prisma.TransactionClient,
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    return tx.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
