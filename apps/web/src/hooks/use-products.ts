import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { PaginatedResponse, ProductDto } from '@ecommerce/shared-types';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export function useProducts(params: ProductQueryParams) {
  const queryString = new URLSearchParams();
  if (params.page) queryString.set('page', params.page.toString());
  if (params.limit) queryString.set('limit', params.limit.toString());
  if (params.search) queryString.set('search', params.search);
  if (params.category) queryString.set('category', params.category);

  return useQuery<PaginatedResponse<ProductDto>>({
    queryKey: ['products', params],
    queryFn: () => fetchApi(`/products?${queryString.toString()}`),
  });
}

export function useProductDetail(id: string) {
  return useQuery<ProductDto>({
    queryKey: ['product', id],
    queryFn: () => fetchApi(`/products/${id}`),
    enabled: !!id,
  });
}
