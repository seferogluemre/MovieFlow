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
      console.log("Socket auth: Token sağlanmadı");
      return next(new Error("Authentication error: Token not provided"));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    if (!decoded || !decoded.userId) {
      console.log("Socket auth: Geçersiz token", decoded);
      return next(new Error("Authentication error: Invalid token"));
    }

    socket.data.userId = decoded.userId;
    console.log(
      `Socket auth: Kullanıcı ${decoded.userId} için token doğrulandı`
    );

    // Find the user in the database to verify they exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      console.log(`Socket auth: Kullanıcı ${decoded.userId} bulunamadı`);
      return next(new Error("Authentication error: User not found"));
    }

    // Socket nesnesine doğrudan userId ekle
    socket.userId = decoded.userId;
    console.log(
      `Socket auth: Kullanıcı ${decoded.userId} için socket veri objesine userId eklendi`
    );

    next();
  } catch (error) {
    console.log("Socket auth error:", error);
    return next(new Error(`Authentication error: ${(error as Error).message}`));
  }
};
