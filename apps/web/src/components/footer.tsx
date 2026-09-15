export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-8 text-center text-xs text-muted-foreground">
      <div className="container px-4">
        <p>© {new Date().getFullYear()} ApexStore E-Commerce Checkout & Payment System. Built with NestJS, Next.js, and Prisma.</p>
      </div>
    </footer>
  );
}
