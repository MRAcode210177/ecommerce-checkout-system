'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { ProductDto } from '@ecommerce/shared-types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/use-cart-store';
import { useState } from 'react';

interface ProductCardProps {
  product: ProductDto;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/50">
      <Link href={`/products/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          <Badge variant="secondary" className="backdrop-blur-md bg-background/80 shadow-sm text-[10px]">
            {product.category}
          </Badge>
          {isOutOfStock ? (
            <Badge variant="destructive" className="shadow-sm text-[10px]">
              Out of Stock
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" className="shadow-sm text-[10px]">
              Only {product.stock} left
            </Badge>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-base tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between pt-3 border-t">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>

          <Button
            size="sm"
            variant={added ? 'secondary' : 'default'}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="gap-1.5 text-xs transition-all"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
