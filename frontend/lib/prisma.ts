/**
 * Prisma Client Singleton
 *
 * This ensures we only create one instance of Prisma Client
 * across the application, which is important for Next.js
 * to avoid connection pool exhaustion in development.
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7: Requires adapter or accelerateUrl in constructor
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prismaClient = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
