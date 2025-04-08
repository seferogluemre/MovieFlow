import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
       res.status(401).json({ message: "Token bulunamadı" });
       return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret") as { userId: number };
    req.user = { id: decoded.userId } as User;
    
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Geçersiz token" });
    return;
  }
};