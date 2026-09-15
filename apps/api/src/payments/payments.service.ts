import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { OrderRepository } from '../orders/repositories/order.repository';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentStatus, OrderStatus, Role } from '@prisma/client';
import {
  ResourceNotFoundException,
  ForbiddenResourceException,
  InvalidStateTransitionException,
  PaymentDeclinedException,
} from '../common/exceptions/domain.exception';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async processPayment(userId: string, userRole: Role, dto: ProcessPaymentDto) {
    // Step 1: Idempotency check
    const existingPayment = await this.paymentRepository.findByIdempotencyKey(dto.idempotencyKey);
    if (existingPayment) {
      if (existingPayment.status === PaymentStatus.DECLINED) {
        throw new PaymentDeclinedException('Transaction previously declined (idempotency key matched).');
      }
      return {
        id: existingPayment.id,
        orderId: existingPayment.orderId,
        idempotencyKey: existingPayment.idempotencyKey,
        amount: Number(existingPayment.amount),
        status: existingPayment.status,
        transactionRef: existingPayment.transactionRef,
        createdAt: existingPayment.createdAt.toISOString(),
      };
    }

    // Step 2: Fetch order & ownership validation
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new ResourceNotFoundException('Order', dto.orderId);
    }

    if (order.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenResourceException('You can only process payments for your own orders.');
    }

    if (order.status !== OrderStatus.RESERVED && order.status !== OrderStatus.PENDING) {
      throw new InvalidStateTransitionException(order.status, OrderStatus.PAID);
    }

    // Step 3: Deterministic mock payment evaluation
    const sanitizedCard = dto.cardNumber.replace(/\s+/g, '');
    const isDeclined = sanitizedCard.endsWith('0000');

    const paymentStatus = isDeclined ? PaymentStatus.DECLINED : PaymentStatus.SUCCESS;
    const transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Step 4: Record payment
    const payment = await this.paymentRepository.createPayment({
      orderId: order.id,
      idempotencyKey: dto.idempotencyKey,
      amount: Number(order.totalAmount),
      status: paymentStatus,
      transactionRef,
    });

    // Step 5: Transition order state on SUCCESS
    if (paymentStatus === PaymentStatus.SUCCESS) {
      await this.orderRepository.updateStatus(order.id, OrderStatus.PAID);
    } else {
      throw new PaymentDeclinedException('Payment declined: card ending in 0000 was supplied.');
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      idempotencyKey: payment.idempotencyKey,
      amount: Number(payment.amount),
      status: payment.status,
      transactionRef: payment.transactionRef,
      createdAt: payment.createdAt.toISOString(),
    };
  }
}
