import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma(): PrismaClient | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  try {
    // Prisma 7 requires a driver adapter — use @prisma/adapter-pg for Supabase Postgres
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter } as any);
  } catch (e) {
    console.error("[prisma] failed to create client:", e);
    return undefined;
  }
}

export const prisma: PrismaClient =
  (globalForPrisma.prisma ?? createPrisma()) as PrismaClient;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
