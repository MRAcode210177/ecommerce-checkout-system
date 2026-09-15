import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { OrderDto, PaginatedResponse } from '@ecommerce/shared-types';

export function useOrders(page = 1, limit = 10) {
  return useQuery<PaginatedResponse<OrderDto>>({
    queryKey: ['orders', page, limit],
    queryFn: () => fetchApi(`/orders?page=${page}&limit=${limit}`),
  });
}

export function useOrderDetail(id: string) {
  return useQuery<OrderDto>({
    queryKey: ['order', id],
    queryFn: () => fetchApi(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useRefundOrder() {
  const queryClient = useQueryClient();

  return useMutation<OrderDto, Error, { orderId: string; reason?: string }>({
    mutationFn: ({ orderId, reason }) =>
      fetchApi<OrderDto>(`/orders/${orderId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
