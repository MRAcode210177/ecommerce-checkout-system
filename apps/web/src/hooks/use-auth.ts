import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { useAuthStore } from '@/store/use-auth-store';
import { AuthResponseDto } from '@ecommerce/shared-types';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      fetchApi<AuthResponseDto>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: { email: string; password: string; name: string }) =>
      fetchApi<AuthResponseDto>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      queryClient.invalidateQueries();
    },
  });
}
