'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogin } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await loginMutation.mutateAsync({ email, password });
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="container px-4 py-16 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-xl border">
        <CardHeader className="space-y-2 text-center border-b pb-6">
          <div className="p-3 bg-primary/10 rounded-full text-primary w-12 h-12 mx-auto flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your ApexStore account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="p-3 rounded-lg bg-muted text-[11px] text-muted-foreground space-y-1">
              <p>💡 <strong>Demo Credentials:</strong></p>
              <p>• User: <code className="text-foreground font-mono">user@example.com</code> / <code className="text-foreground font-mono">password123</code></p>
              <p>• Admin: <code className="text-foreground font-mono">admin@example.com</code> / <code className="text-foreground font-mono">password123</code></p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-muted/10">
            <Button type="submit" isLoading={loginMutation.isPending} className="w-full gap-2 font-semibold">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
