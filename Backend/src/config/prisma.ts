import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

prisma.$use(async (params: any, next: (params: any) => Promise<any>) => {
  try {
    return await next(params);
  } catch (error) {
    console.error(`Prisma Error: ${params.model}.${params.action}`, error);
    throw error;
  }
});
