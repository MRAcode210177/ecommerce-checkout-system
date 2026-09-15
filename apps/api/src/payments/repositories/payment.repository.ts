import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Payment, PaymentStatus, Refund, Prisma } from '@prisma/client';

export interface CreatePaymentData {
  orderId: string;
  idempotencyKey: string;
  amount: number;
  status: PaymentStatus;
  transactionRef: string;
}

export interface CreateRefundData {
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
}

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { idempotencyKey: key },
    });
  }

  async createPayment(data: CreatePaymentData): Promise<Payment> {
    return this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        idempotencyKey: data.idempotencyKey,
        amount: data.amount,
        status: data.status,
        transactionRef: data.transactionRef,
      },
    });
  }

  async createRefundTx(tx: Prisma.TransactionClient, data: CreateRefundData): Promise<Refund> {
    return tx.refund.create({
      data: {
        orderId: data.orderId,
        paymentId: data.paymentId,
        amount: data.amount,
        reason: data.reason,
      },
    });
  }
}
