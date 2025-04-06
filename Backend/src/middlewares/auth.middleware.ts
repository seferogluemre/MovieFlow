import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import prisma from "../config/database";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader);

    if (!authHeader) {
      res.status(401).json({ message: "No authorization header provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    if (!token) {
      res
        .status(401)
        .json({ message: "No token provided in authorization header" });
      return;
    }

    const decoded = verifyToken(token);
    console.log("Decoded:", decoded);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res
      .status(401)
      .json({ message: "Invalid token", error: (error as Error).message });
  }
};
