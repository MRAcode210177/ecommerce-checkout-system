'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProductDetail } from '@/hooks/use-products';
import { useCartStore } from '@/store/use-cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, ShoppingCart, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: product, isLoading, isError, error } = useProductDetail(id);
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <div className="container px-4 sm:px-8 py-8 space-y-8 max-w-5xl">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container px-4 py-16 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'The requested product could not be found.'}
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="container px-4 sm:px-8 py-8 space-y-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-card border shadow-sm">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge variant="warning">Low Stock ({product.stock} left)</Badge>
              ) : (
                <Badge variant="success">In Stock ({product.stock} available)</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">{product.name}</h1>
            <p className="text-3xl font-extrabold text-primary">{formatPrice(product.price)}</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed border-t pt-4">
            {product.description}
          </p>

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-50 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-50 text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <Button
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="w-full gap-2 text-base font-semibold transition-all"
            >
              {added ? (
                <>
                  <Check className="h-5 w-5 text-emerald-400" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart ({formatPrice(product.price * quantity)})
                </>
              )}
            </Button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-4 border-t pt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Atomic Stock Lock Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
