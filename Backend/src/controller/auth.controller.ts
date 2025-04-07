import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { UserService } from "src/services/user.service";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { logInfo, logWarn } from "src/utils/logging/logger.util";
import { AuthService } from "src/services/auth.service";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || typeof email !== "string") {
        logWarn(`Login User --- Email is required `);
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const existingUser = await UserService.getUserByEmail(email);

      if (!existingUser) {
        logWarn(`Login User --- Invalid email or password `);
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        logWarn(`Login User --- Invalid email or password `);
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      const accessTokenExpiresIn = 15 * 60;
      const accessToken = jwt.sign({ userId: existingUser.id }, JWT_SECRET, {
        expiresIn: accessTokenExpiresIn,
      });

      const refreshTokenExpiresIn = 7 * 24 * 60 * 60;
      const refreshToken = jwt.sign(
        { userId: existingUser.id },
        JWT_REFRESH_SECRET,
        {
          expiresIn: refreshTokenExpiresIn,
        }
      );

      const now = new Date();
      const expiresAt = new Date(now.getTime() + accessTokenExpiresIn * 1000);
      const session = await AuthService.create(existingUser.id);

      logInfo("Login User --- Login successful 🚀");

      res.status(200).json({
        message: "Login successful",
        accessToken,
        refreshToken,
        session,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        logWarn(`Login User - Refresh token is required`);
        res.status(400).json({ message: " Refresh token is required" });
      }

      const decoded = jwt.verify(
        refreshToken,
        String(JWT_REFRESH_SECRET)
      ) as JwtPayload;

      if (!decoded.userId) {
        logWarn(`Login User - Invalid token`);
        res.status(400).json({ message: "Invalid token" });
      }

      const { userId } = decoded;

      const session = await AuthService.get(userId);

      if (!session) {
        logWarn(`Login User - Invalid refresh token`);
        res.status(400).json({ message: "Invalid refresh token" });
      }

      const updatedSession = await AuthService.update(Number(session?.id));

      logInfo(`Login User - Logout Successfully`);
      res.status(200).json({ message: "Başarıyla çıkış yapıldı" });
    } catch (error) {
      res.status(500).json({
        message: "Logout User Error",
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      });
    }
  }
}
