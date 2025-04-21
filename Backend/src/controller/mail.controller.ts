import { EmailService } from "@/services/mail.service";
import { Request, Response } from "express";

/**
 * Kullanıcıya e-posta doğrulama kodu gönderir
 * @param req - HTTP İsteği (email gereklidir)
 * @param res - HTTP Yanıtı
 */
export const sendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "E-posta adresi gereklidir" });
    return;
  }

  try {
    // EmailService'i çağırarak işlemi gerçekleştir
    const result = await EmailService.sendVerificationEmailToUser(email);

    if (result.success) {
      res.status(200).json({
        message: result.message,
        email: result.email,
      });
    } else {
      // Başarısız olma durumundaki hata kodunu belirle
      const statusCode = result.message.includes("bulunamadı") ? 404 : 500;
      res.status(statusCode).json({ message: result.message });
    }
  } catch (error) {
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
  const { email, code } = req.body;

  if (!email || !code) {
    res
      .status(400)
      .json({ message: "E-posta adresi ve doğrulama kodu gereklidir" });
    return;
  }

  try {
    // EmailService'i çağırarak doğrulama işlemini gerçekleştir
    const result = await EmailService.verifyUserEmail(email, code);

    if (result.success) {
      res.status(200).json({
        message: result.message,
        email: result.email,
      });
    } else {
      // Hata mesajına göre uygun HTTP durum kodunu belirle
      let statusCode = 400;
      if (result.message.includes("bulunamadı")) {
        statusCode = 404;
      }

      res.status(statusCode).json({ message: result.message });
    }
  } catch (error) {
    console.error("Error in verifyEmail controller:", error);
    res.status(500).json({ message: "Bir hata oluştu", error });
  }
};
