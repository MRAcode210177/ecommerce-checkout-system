import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductDto } from '@ecommerce/shared-types';

export interface CartItem {
  product: ProductDto;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: ProductDto, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (product: ProductDto, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const newQty = updated[existingIndex].quantity + quantity;
          // Clamp to available stock
          updated[existingIndex].quantity = Math.min(newQty, product.stock);
          set({ items: updated, isCartOpen: true });
        } else {
          const initialQty = Math.min(quantity, product.stock);
          set({ items: [...currentItems, { product, quantity: initialQty }], isCartOpen: true });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const updated = get().items.map((item) => {
          if (item.product.id === productId) {
            const clamped = Math.min(quantity, item.product.stock);
            return { ...item, quantity: clamped };
          }
          return item;
        });

        set({ items: updated });
      },

      clearCart: () => {
        set({ items: [] });
      },

      setCartOpen: (open: boolean) => {
        set({ isCartOpen: open });
      },

      toggleCart: () => {
        set({ isCartOpen: !get().isCartOpen });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
