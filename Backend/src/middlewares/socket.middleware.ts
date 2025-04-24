import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { CustomSocket } from "../types/socket.types";

const prisma = new PrismaClient();

export const socketAuthMiddleware = async (
  socket: CustomSocket,
  next: Function
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    if (!decoded || !decoded.userId) {
      return next(new Error("Authentication error: Invalid token"));
    }

    socket.data.userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.userId = decoded.userId;
    next();
  } catch (error) {
    return next(new Error(`Authentication error: ${(error as Error).message}`));
  }
};
