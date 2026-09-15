'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders, useRefundOrder } from '@/hooks/use-orders';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationControls } from '@/components/pagination-controls';
import { formatPrice } from '@/lib/utils';
import { Package, RotateCcw, ArrowRight, Lock, Clock, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useOrders(page, 5);
  const refundMutation = useRefundOrder();

  const [refundMsg, setRefundMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);

  if (!isAuthenticated()) {
    return (
      <div className="container px-4 py-16 text-center max-w-md mx-auto space-y-6">
        <div className="p-4 bg-primary/10 rounded-full text-primary w-12 h-12 mx-auto flex items-center justify-center">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Authentication Required</h2>
        <p className="text-sm text-muted-foreground">
          Log in to view your past orders and manage order refunds.
        </p>
        <Link href="/login">
          <Button className="w-32">Sign In</Button>
        </Link>
      </div>
    );
  }

  const handleRefund = async (orderId: string) => {
    setRefundMsg(null);
    try {
      await refundMutation.mutateAsync({ orderId, reason: 'Customer requested refund via dashboard.' });
      setRefundMsg({ id: orderId, type: 'success', text: 'Order refunded successfully and stock was restored.' });
    } catch (err: any) {
      setRefundMsg({ id: orderId, type: 'error', text: err.message || 'Failed to refund order.' });
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return 'success';
      case 'REFUNDED':
        return 'destructive';
      case 'RESERVED':
      case 'PENDING':
        return 'warning';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container px-4 sm:px-8 py-8 space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track past purchases, view receipts, and process refunds.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
          <h3 className="font-semibold text-lg">Error loading order history</h3>
          <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'An error occurred.'}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : data?.items.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border bg-card space-y-4">
          <div className="p-4 bg-muted rounded-full text-muted-foreground w-16 h-16 mx-auto flex items-center justify-center">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">No past orders yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Once you make a purchase, your orders will appear here.
          </p>
          <Link href="/">
            <Button size="sm">Browse Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.items.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="border-b bg-muted/20 flex flex-row items-center justify-between py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Order #{order.id.slice(-8)}</span>
                    <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-foreground">{formatPrice(order.totalAmount)}</span>
                  {order.status === 'PAID' && (
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={refundMutation.isPending}
                      onClick={() => handleRefund(order.id)}
                      className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Refund
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4">
                {refundMsg && refundMsg.id === order.id && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${
                      refundMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {refundMsg.text}
                  </div>
                )}

                <div className="divide-y">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
                            alt={item.product?.name || 'Item'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs truncate">{item.product?.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatPrice(item.priceAtPurchase)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-xs flex-shrink-0">
                        {formatPrice(item.priceAtPurchase * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <PaginationControls page={page} totalPages={data?.totalPages || 1} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
