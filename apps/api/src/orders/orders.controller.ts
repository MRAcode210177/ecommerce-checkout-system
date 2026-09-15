import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getUserOrders(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
    @Query() query: QueryOrdersDto,
  ) {
    return this.ordersService.getUserOrders(userId, userRole, query);
  }

  @Get(':id')
  async getOrderById(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
    @Param('id') id: string,
  ) {
    return this.ordersService.getOrderById(userId, userRole, id);
  }

  @Post(':id/refund')
  async refundOrder(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
    @Param('id') id: string,
    @Body() dto: RefundOrderDto,
  ) {
    return this.ordersService.refundOrder(userId, userRole, id, dto);
  }
}
