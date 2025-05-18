import { Prisma, PrismaClient } from "@prisma/client";

const enableQueryLog = false;
const prisma = new PrismaClient(
  enableQueryLog
    ? {
        log: [
          {
            emit: "event",
            level: "query",
          },
          {
            emit: "stdout",
            level: "error",
          },
          {
            emit: "stdout",
            level: "info",
          },
          {
            emit: "stdout",
            level: "warn",
          },
        ],
      }
    : undefined
);
export const PrismaModelNameSnakeCase = Object.keys(prisma).filter(
  (key) => !key.startsWith("$")
) as unknown as PrismaModelNameSnakeCase;
// eslint-disable-next-line
export type PrismaModelNameSnakeCase = Exclude<
  {
    [K in keyof typeof prisma]: K extends `$${string}` ? never : K;
  }[keyof typeof prisma],
  symbol
>;
export const PrismaModelNamePascalCase = Object.values(Prisma.ModelName);
// eslint-disable-next-line
export type PrismaModelNamePascalCase =
  (typeof PrismaModelNamePascalCase)[number];
export default prisma;
