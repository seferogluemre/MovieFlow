import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth/jwt.util";
import { AppError } from "./error.middleware";
import { User } from "@prisma/client";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, {
        code: "UNAUTHORIZED",
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(401, {
        code: "UNAUTHORIZED",
        message: "Invalid token format"
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded as unknown as User;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, {
        code: "UNAUTHORIZED",
        message: "Invalid token"
      }));
    }
  }
};
