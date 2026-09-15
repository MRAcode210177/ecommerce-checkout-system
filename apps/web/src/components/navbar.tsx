'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ShoppingCart, User, LogOut, Package, Store } from 'lucide-react';
import { ThemeToggle } from './ui/theme-toggle';
import { Button } from './ui/button';
import { useCartStore } from '@/store/use-cart-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useState, useEffect } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const toggleCart = useCartStore((state) => state.toggleCart);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? getTotalItems() : 0;
  const loggedIn = mounted ? isAuthenticated() : false;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md transition-colors">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span>ApexStore</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-primary ${
                pathname === '/' ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              Catalog
            </Link>
            {loggedIn && (
              <Link
                href="/orders"
                className={`transition-colors hover:text-primary ${
                  pathname.startsWith('/orders') ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                My Orders
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Button
            variant="outline"
            size="icon"
            onClick={toggleCart}
            className="relative w-9 h-9"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                {itemCount}
              </span>
            )}
          </Button>

          {loggedIn ? (
            <div className="flex items-center gap-2 border-l pl-3 ml-1">
              <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
                Hi, {user?.name.split(' ')[0]}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l pl-3 ml-1">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-xs">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
