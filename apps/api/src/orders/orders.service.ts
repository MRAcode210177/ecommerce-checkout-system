import { Injectable } from '@nestjs/common';
import { OrderRepository } from './repositories/order.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { PaymentRepository } from '../payments/repositories/payment.repository';
import { PrismaService } from '../prisma/prisma.service';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { OrderStatus, PaymentStatus, Role } from '@prisma/client';
import {
  ResourceNotFoundException,
  ForbiddenResourceException,
  InvalidStateTransitionException,
} from '../common/exceptions/domain.exception';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getUserOrders(userId: string, userRole: Role, query: QueryOrdersDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const [orders, total] =
      userRole === Role.ADMIN
        ? await this.orderRepository.findAllOrders(query)
        : await this.orderRepository.findUserOrders(userId, query);

    return {
      items: orders.map((order) => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getOrderById(userId: string, userRole: Role, orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new ResourceNotFoundException('Order', orderId);
    }

    if (order.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenResourceException('You do not have access to view this order.');
    }

    return this.formatOrderResponse(order);
  }

  async refundOrder(userId: string, userRole: Role, orderId: string, dto: RefundOrderDto) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new ResourceNotFoundException('Order', orderId);
    }

    if (order.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenResourceException('You do not have access to refund this order.');
    }

    if (order.status !== OrderStatus.PAID) {
      throw new InvalidStateTransitionException(order.status, OrderStatus.REFUNDED);
    }

    const successfulPayment = order.payments.find((p) => p.status === PaymentStatus.SUCCESS);
    if (!successfulPayment) {
      throw new InvalidStateTransitionException(
        order.status,
        OrderStatus.REFUNDED,
      );
    }

    const refundedOrder = await this.prisma.$transaction(async (tx) => {
      // Step 1: Create Refund record
      await this.paymentRepository.createRefundTx(tx, {
        orderId: order.id,
        paymentId: successfulPayment.id,
        amount: Number(order.totalAmount),
        reason: dto.reason || 'Customer requested refund.',
      });

      // Step 2: Restore stock for all items
      for (const item of order.items) {
        await this.productRepository.incrementStockTx(tx, item.productId, item.quantity);
      }

      // Step 3: Transition order status to REFUNDED
      return this.orderRepository.updateStatusTx(tx, order.id, OrderStatus.REFUNDED);
    });

    const updated = await this.orderRepository.findById(refundedOrder.id);
    return this.formatOrderResponse(updated);
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
