import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('password123', saltRounds);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Jane Doe',
      passwordHash,
      role: Role.USER,
    },
  });

  console.log(`Created users: Admin (${admin.email}), User (${demoUser.email})`);

  // Create demo products
  const products = [
    {
      name: 'Wireless Noise-Canceling Headphones',
      description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
      price: 299.99,
      stock: 25,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Mechanical Gaming Keyboard',
      description: 'RGB backlit mechanical keyboard with tactile switches and customizable macros.',
      price: 129.50,
      stock: 15,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Minimalist Leather Smartwatch',
      description: 'Elegant smartwatch with fitness tracking, heart rate monitor, and leather strap.',
      price: 189.00,
      stock: 40,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Organic Cotton Crewneck T-Shirt',
      description: 'Ultra-soft 100% organic cotton t-shirt built for daily comfort.',
      price: 34.99,
      stock: 100,
      category: 'Apparel',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Classic Denim Jacket',
      description: 'Timeless denim jacket with durable stitching and button closure.',
      price: 89.95,
      stock: 30,
      category: 'Apparel',
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Waterproof Canvas Backpack',
      description: 'Spacious 25L travel backpack with padded laptop sleeve and weather-resistant canvas.',
      price: 75.00,
      stock: 50,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Ergonomic Desk Chair',
      description: 'Adjustable mesh office chair with lumbar support and 3D armrests.',
      price: 249.00,
      stock: 8,
      category: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Stainless Steel Insulated Water Bottle',
      description: 'Double-wall vacuum insulated 32oz bottle keeps drinks cold for 24 hours.',
      price: 28.50,
      stock: 75,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Pour-Over Coffee Maker Set',
      description: 'Borosilicate glass carafe with stainless steel mesh filter for rich artisanal coffee.',
      price: 42.00,
      stock: 3, // Low stock for testing edge cases
      category: 'Home',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Studio Monitor Speakers (Pair)',
      description: 'High-fidelity active studio monitors with balanced TRS inputs and flat frequency response.',
      price: 349.99,
      stock: 12,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seeded ${products.length} products successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
