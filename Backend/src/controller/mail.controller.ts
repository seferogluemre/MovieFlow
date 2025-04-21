import { EmailService } from "@/services/mail.service";
import {
  sendVerificationEmailSchema,
  verifyEmailSchema,
} from "@/validators/mail.validation";
import { Request, Response } from "express";
import { ZodError } from "zod";

/**
 * Kullanıcıya e-posta doğrulama kodu gönderir
 * @param req - HTTP İsteği (email gereklidir)
 * @param res - HTTP Yanıtı
 */
export const sendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Zod ile gelen verileri doğrula
    const validatedData = sendVerificationEmailSchema.parse(req.body);
    const { email } = validatedData;

    const result = await EmailService.sendVerificationEmailToUser(email);

    if (result.success) {
      res.status(200).json({
        message: result.message,
        email: result.email,
      });
    } else {
      const statusCode = result.message.includes("bulunamadı") ? 404 : 500;
      res.status(statusCode).json({ message: result.message });
    }
  } catch (error) {
    // Zod validasyon hatası kontrolü
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validasyon hatası",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    console.error("Error in sendVerificationEmail controller:", error);
    res.status(500).json({ message: "Bir hata oluştu", error });
  }
};

/**
 * Kullanıcının e-posta doğrulama kodunu kontrol eder
 * @param req - HTTP İsteği (email ve code gereklidir)
 * @param res - HTTP Yanıtı
 */
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = verifyEmailSchema.parse(req.body);
    const { email, code } = validatedData;

    const result = await EmailService.verifyUserEmail(email, code);

    if (result.success) {
      res.status(200).json({
        message: result.message,
        email: result.email,
      });
    } else {
      let statusCode = 400;
      if (result.message.includes("bulunamadı")) {
        statusCode = 404;
      }

      res.status(statusCode).json({ message: result.message });
    }
  } catch (error) {
    // Zod validasyon hatası kontrolü
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validasyon hatası",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    console.error("Error in verifyEmail controller:", error);
    res.status(500).json({ message: "Bir hata oluştu", error });
  }
};
