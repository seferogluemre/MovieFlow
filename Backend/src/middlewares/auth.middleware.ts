import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Token bulunamadı" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret") as { userId: number };
    req.user = { id: decoded.userId } as User;
    
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Geçersiz token" });
  }
};