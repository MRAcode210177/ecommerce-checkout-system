'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrderDetail } from '@/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, Package, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: order, isLoading, isError, error } = useOrderDetail(id);

  if (isLoading) {
    return (
      <div className="container px-4 py-16 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container px-4 py-16 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'The requested order confirmation could not be loaded.'}
        </p>
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  const isPaid = order.status === 'PAID' || order.status === 'COMPLETED';

  return (
    <div className="container px-4 sm:px-8 py-12 max-w-3xl mx-auto space-y-8">
      {/* Status Header */}
      <div className="text-center space-y-3">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-emerald-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Order Confirmed!</h1>
        <p className="text-sm text-muted-foreground">
          Thank you for your order. Your stock has been reserved and payment was successfully processed.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Order #{order.id.slice(-8)}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <Badge variant={isPaid ? 'success' : 'warning'}>{order.status}</Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Items Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Itemized Summary</h3>
            <div className="divide-y rounded-lg border bg-background/50">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
                        alt={item.product?.name || 'Product'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold truncate">{item.product?.name || 'Product'}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.priceAtPurchase)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0">
                    {formatPrice(item.priceAtPurchase * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Reference */}
          {order.payments && order.payments.length > 0 && (
            <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Reference:</span>
                <span className="font-mono font-semibold">{order.payments[0].transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idempotency Key:</span>
                <span className="font-mono text-muted-foreground">{order.idempotencyKey || 'N/A'}</span>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-base font-bold text-foreground">
              <span>Total Paid</span>
              <span className="text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center pt-4">
        <Link href="/orders">
          <Button variant="outline" className="gap-2">
            <Package className="h-4 w-4" />
            View Order History
          </Button>
        </Link>
        <Link href="/">
          <Button className="gap-2">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
