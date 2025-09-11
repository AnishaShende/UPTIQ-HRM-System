import { PrismaClient } from "@prisma/client";

// Create a global prisma instance to avoid multiple connections
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: ['query', 'error', 'info', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
