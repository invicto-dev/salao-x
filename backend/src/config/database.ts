import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;

