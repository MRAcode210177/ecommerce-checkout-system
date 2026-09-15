'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PaginationControls } from '@/components/pagination-controls';
import { Search, SlidersHorizontal, PackageSearch, RefreshCw } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Apparel', 'Accessories', 'Home'];

export default function CatalogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categoryQuery = selectedCategory === 'All' ? undefined : selectedCategory;

  const { data, isLoading, isError, error, refetch } = useProducts({
    page,
    limit: 8,
    search: search.trim() || undefined,
    category: categoryQuery,
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="container px-4 sm:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 sm:p-12 border">
        <div className="max-w-2xl space-y-4">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Curated Premium Catalog
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Experience Seamless Checkout & Instant Delivery
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Discover cutting-edge electronics, apparel, and lifestyle products with atomic stock reservation and instant order verification.
          </p>
        </div>
      </div>

      {/* Filters & Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 bg-background"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategorySelect(cat)}
              className="rounded-full text-xs transition-all"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3 rounded-xl border p-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-4">
          <div className="p-3 bg-destructive/10 rounded-full text-destructive">
            <PackageSearch className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">Failed to load catalog</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error instanceof Error ? error.message : 'Could not retrieve products from backend.'}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border bg-card space-y-3">
          <div className="p-4 bg-muted rounded-full text-muted-foreground">
            <PackageSearch className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We couldn't find any products matching your search term "{search}". Try clearing search filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <PaginationControls page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
