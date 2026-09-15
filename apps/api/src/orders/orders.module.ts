import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderRepository } from './repositories/order.repository';
import { PaymentRepository } from '../payments/repositories/payment.repository';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository, PaymentRepository],
  exports: [OrdersService, OrderRepository],
})
export class OrdersModule {}
