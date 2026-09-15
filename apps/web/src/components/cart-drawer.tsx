'use client';

import { useCartStore } from '@/store/use-cart-store';
import { Button } from './ui/button';
import { formatPrice } from '@/lib/utils';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-card text-card-foreground shadow-2xl border-l border-border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Your Cart ({items.length})</h2>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCartOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="p-4 bg-muted rounded-full text-muted-foreground">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-base">Your cart is empty</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Browse our catalog and add items to your cart to begin checkout.
                </p>
                <Button size="sm" onClick={() => setCartOpen(false)} className="mt-2">
                  Explore Products
                </Button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 p-3 rounded-lg border bg-background/50 relative group">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-sm font-medium line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{formatPrice(product.price)} each</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 hover:bg-muted transition-colors rounded-l-md"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-1 hover:bg-muted transition-colors rounded-r-md disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold">{formatPrice(product.price * quantity)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t bg-muted/20 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearCart} className="text-xs">
                  Clear
                </Button>
                <Link href="/checkout" className="flex-1" onClick={() => setCartOpen(false)}>
                  <Button className="w-full gap-2 text-sm font-semibold">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
