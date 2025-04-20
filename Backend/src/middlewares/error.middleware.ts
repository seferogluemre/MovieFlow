import { NextFunction, Request, Response } from "express";
import { ApiError } from "../types/api.types";

export class AppError extends Error {
  constructor(public statusCode: number, public error: ApiError) {
    super(error.message);
    this.name = "AppError";
  }
}

interface PrismaError extends Error {
  code?: string;
  meta?: {
    target?: string[];
    field_name?: string;
  };
  clientVersion?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error caught in middleware:", err);

  const prismaError = err as PrismaError;

  if (prismaError.code) {
    switch (prismaError.code) {
      case "P2002": // Unique constraint failed
        const field = prismaError.meta?.target?.[0] || "field";
        res.status(409).json({
          message: `A record with this ${field} already exists.`,
          code: prismaError.code,
          meta: prismaError.meta,
        });
        return;

      case "P2003":
        res.status(409).json({
          message: "This operation references a record that doesn't exist.",
          code: prismaError.code,
          meta: prismaError.meta,
        });
        return;

      case "P2025": // Record not found
        res.status(404).json({
          message: "The requested record was not found.",
          code: prismaError.code,
          meta: prismaError.meta,
        });
        return;

      case "P2000":
        res.status(400).json({
          message: "One of the input values is too long.",
          code: prismaError.code,
          meta: prismaError.meta,
        });
        return;

      default:
        res.status(500).json({
          message: "Database operation failed.",
          code: prismaError.code,
          meta: prismaError.meta,
        });
        return;
    }
  }

  // JWT hatalarını kontrol et
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      message: "Invalid token",
      error: err.message,
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      message: "Token expired",
      error: err.message,
    });
    return;
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
