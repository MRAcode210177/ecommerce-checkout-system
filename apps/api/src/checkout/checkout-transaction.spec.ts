import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductRepository } from '../products/repositories/product.repository';
import { OrderRepository } from '../orders/repositories/order.repository';
import { InsufficientStockException } from '../common/exceptions/domain.exception';
import { OrderStatus } from '@prisma/client';

describe('CheckoutService Transaction & Stock Reservation', () => {
  let service: CheckoutService;
  let prismaService: any;
  let productRepository: any;
  let orderRepository: any;

  beforeEach(async () => {
    prismaService = {
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    productRepository = {
      findByIdForUpdateTx: jest.fn(),
      decrementStockTx: jest.fn(),
    };

    orderRepository = {
      findByIdempotencyKey: jest.fn(),
      createOrderTx: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: PrismaService, useValue: prismaService },
        { provide: ProductRepository, useValue: productRepository },
        { provide: OrderRepository, useValue: orderRepository },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should successfully reserve stock and create order when stock is available', async () => {
    const userId = 'user-123';
    const dto = {
      items: [{ productId: 'prod-1', quantity: 2 }],
      idempotencyKey: 'key-abc',
    };

    orderRepository.findByIdempotencyKey.mockResolvedValue(null);

    productRepository.findByIdForUpdateTx.mockResolvedValue({
      id: 'prod-1',
      name: 'Wireless Headphones',
      stock: 10,
      price: 150.0,
    });

    const mockOrder = {
      id: 'order-999',
      userId,
      status: OrderStatus.RESERVED,
      totalAmount: 300.0,
      idempotencyKey: 'key-abc',
      items: [
        {
          id: 'item-1',
          orderId: 'order-999',
          productId: 'prod-1',
          quantity: 2,
          priceAtPurchase: 150.0,
          product: { id: 'prod-1', name: 'Wireless Headphones', price: 150.0 },
        },
      ],
      payments: [],
      refunds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orderRepository.createOrderTx.mockResolvedValue(mockOrder);

    const result = await service.checkout(userId, dto);

    expect(productRepository.findByIdForUpdateTx).toHaveBeenCalledWith(prismaService, 'prod-1');
    expect(productRepository.decrementStockTx).toHaveBeenCalledWith(prismaService, 'prod-1', 2);
    expect(orderRepository.createOrderTx).toHaveBeenCalledWith(
      prismaService,
      userId,
      [{ productId: 'prod-1', quantity: 2, priceAtPurchase: 150.0 }],
      300.0,
      'key-abc',
    );
    expect(result.id).toBe('order-999');
    expect(result.status).toBe(OrderStatus.RESERVED);
    expect(result.totalAmount).toBe(300.0);
  });

  it('should throw InsufficientStockException and abort transaction when stock is insufficient', async () => {
    const userId = 'user-123';
    const dto = {
      items: [{ productId: 'prod-low-stock', quantity: 5 }],
    };

    orderRepository.findByIdempotencyKey.mockResolvedValue(null);

    productRepository.findByIdForUpdateTx.mockResolvedValue({
      id: 'prod-low-stock',
      name: 'Pour-Over Coffee Maker Set',
      stock: 2, // Only 2 in stock, requested 5
      price: 42.0,
    });

    await expect(service.checkout(userId, dto)).rejects.toThrow(InsufficientStockException);

    expect(productRepository.decrementStockTx).not.toHaveBeenCalled();
    expect(orderRepository.createOrderTx).not.toHaveBeenCalled();
  });

  it('should return existing order immediately when idempotencyKey matches prior transaction', async () => {
    const userId = 'user-123';
    const dto = {
      items: [{ productId: 'prod-1', quantity: 1 }],
      idempotencyKey: 'duplicate-key-001',
    };

    const existingOrder = {
      id: 'order-existing',
      userId,
      status: OrderStatus.RESERVED,
      totalAmount: 150.0,
      idempotencyKey: 'duplicate-key-001',
      items: [],
      payments: [],
      refunds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orderRepository.findByIdempotencyKey.mockResolvedValue(existingOrder);

    const result = await service.checkout(userId, dto);

    expect(result.id).toBe('order-existing');
    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });
});
