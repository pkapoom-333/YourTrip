import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

// Load environment variables (server-side only)
if (typeof window === "undefined") {
  require("dotenv/config");
}

// Debug: Check if DATABASE_URL is loaded
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✓ Loaded" : "✗ Not loaded");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create PrismaClient instance with SQLite adapter
// In Prisma 7, SQLite requires a driver adapter
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

// Ensure databaseUrl is a string and handle the path correctly
if (!databaseUrl || typeof databaseUrl !== "string") {
  throw new Error("DATABASE_URL must be a valid string");
}

// Remove "file:" prefix and get the actual path
let dbPath = databaseUrl.replace(/^file:/, "");

// Resolve relative paths to absolute paths
if (!path.isAbsolute(dbPath)) {
  dbPath = path.resolve(process.cwd(), dbPath);
}

// Ensure DATABASE_URL is set in environment for Prisma adapter
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

// Create adapter with config object containing url
const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
