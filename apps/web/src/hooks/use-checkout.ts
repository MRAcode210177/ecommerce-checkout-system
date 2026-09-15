import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { OrderDto, PaymentDto } from '@ecommerce/shared-types';

export interface CheckoutPayload {
  items: { productId: string; quantity: number }[];
  idempotencyKey?: string;
}

export interface ProcessPaymentPayload {
  orderId: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  idempotencyKey: string;
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation<OrderDto, Error, CheckoutPayload>({
    mutationFn: (payload) =>
      fetchApi<OrderDto>('/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentDto, Error, ProcessPaymentPayload>({
    mutationFn: (payload) =>
      fetchApi<PaymentDto>('/payments/process', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
