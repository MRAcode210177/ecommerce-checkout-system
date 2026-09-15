import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDto } from '@ecommerce/shared-types';

interface AuthStore {
  accessToken: string | null;
  user: UserDto | null;
  setAuth: (token: string, user: UserDto) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setAuth: (token: string, user: UserDto) => {
        set({ accessToken: token, user });
      },

      logout: () => {
        set({ accessToken: null, user: null });
      },

      isAuthenticated: () => {
        return !!get().accessToken;
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
