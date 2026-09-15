'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/use-cart-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useCheckout, useProcessPayment } from '@/hooks/use-checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { CreditCard, Lock, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const checkoutMutation = useCheckout();
  const paymentMutation = useProcessPayment();

  // Form State
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subtotal = getSubtotal();

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    try {
      // Step 1: Execute atomic checkout transaction to reserve stock & create order
      const checkoutKey = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const order = await checkoutMutation.mutateAsync({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        idempotencyKey: checkoutKey,
      });

      // Step 2: Execute mock payment
      const paymentKey = `pay_${order.id}_${Date.now()}`;
      await paymentMutation.mutateAsync({
        orderId: order.id,
        cardNumber,
        expiry,
        cvc,
        idempotencyKey: paymentKey,
      });

      // Clear local cart store and redirect to confirmation page
      clearCart();
      router.push(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'An error occurred during checkout processing.');
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="container px-4 py-16 text-center max-w-md mx-auto space-y-6">
        <div className="p-4 bg-primary/10 rounded-full text-primary w-12 h-12 mx-auto flex items-center justify-center">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Authentication Required</h2>
        <p className="text-sm text-muted-foreground">
          Please log in or register an account to complete your purchase and reserve items.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button className="w-32">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-32">Register</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container px-4 py-16 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
        <p className="text-sm text-muted-foreground">
          Add items to your cart before proceeding to checkout.
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

  const isSubmitting = checkoutMutation.isPending || paymentMutation.isPending;

  return (
    <div className="container px-4 sm:px-8 py-8 space-y-8 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Shopping
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>

      {errorMsg && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold">Checkout Failed</h4>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Payment & Customer Information */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Card Number</label>
                <Input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  required
                />
                <p className="text-[11px] text-muted-foreground bg-muted p-2 rounded-md">
                  💡 <strong>Test Payment Rule:</strong> Card ending in <code className="bg-background px-1 rounded border">0000</code> will simulate payment decline. Any other card will succeed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Expiry Date</label>
                  <Input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">CVC</label>
                  <Input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl border bg-muted/30 flex items-center gap-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
            <span>
              Your transaction is secured with row-level stock locks and 256-bit encryption. Stock is reserved atomically upon order submission.
            </span>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <Card className="sticky top-24">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Order Summary ({items.length} items)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="relative h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs truncate">{product.name}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-xs flex-shrink-0">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-emerald-500 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t text-foreground">
                  <span>Total Due</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/20 border-t p-6">
              <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full font-semibold">
                {isSubmitting ? 'Processing Payment...' : `Pay ${formatPrice(subtotal)}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
