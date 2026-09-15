import { Role, OrderStatus, PaymentStatus } from './enums.js';

// Global Standard API Response Shape
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
}

// User / Auth DTOs
export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}

// Product DTOs
export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Order & Checkout DTOs
export interface CheckoutItemDto {
  productId: string;
  quantity: number;
}

export interface OrderItemDto {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  product?: ProductDto;
}

export interface OrderDto {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  idempotencyKey?: string | null;
  items: OrderItemDto[];
  payments?: PaymentDto[];
  refunds?: RefundDto[];
  createdAt: string;
  updatedAt: string;
}

// Payment DTOs
export interface PaymentDto {
  id: string;
  orderId: string;
  idempotencyKey: string;
  amount: number;
  status: PaymentStatus;
  transactionRef: string;
  createdAt: string;
}

export interface RefundDto {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
  createdAt: string;
}
