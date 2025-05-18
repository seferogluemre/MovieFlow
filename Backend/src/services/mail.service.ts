import { mailTransporter, verifyMailConnection } from "@/config/mail.config";
import { createVerificationData, generateVerificationCode } from "@/utils/mail";
import prisma from "@core/prisma";
import fs from "fs";
import path from "path";

export class EmailService {
  static transporter = mailTransporter;

  // Use the generateVerificationCode from utils
  static generateVerificationCode = generateVerificationCode;

  // Use the verifyConnection function from config
  static verifyConnection = verifyMailConnection;

  /**
   * Kullanıcıya e-posta doğrulama kodu gönderir ve veritabanını günceller
   * @param email - Kullanıcının e-posta adresi
   * @returns Promise<{success: boolean, message: string, email?: string}>
   */
  static async sendVerificationEmailToUser(
    email: string
  ): Promise<{ success: boolean; message: string; email?: string }> {
    try {
      // E-posta ile kullanıcıyı bul
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          message: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı",
        };
      }

      const verificationCode = generateVerificationCode();

      const verificationData = createVerificationData(verificationCode);

      await prisma.user.update({
        where: { email },
        data: {
          verificationCode,
          verificationCodeExpiresAt: verificationData.expires,
          verificationCodeSentAt: new Date(),
          verificationCodeUsed: false,
        },
      });

      const htmlContent = this.generateVerificationEmail(
        user.username,
        verificationCode
      );

      const result = await this.sendEmailWithDynamicFrom(
        email,
        "E-posta Adresinizi Doğrulayın - MovieFlow",
        htmlContent,
        "MovieFlow",
        process.env.SMTP_USER || "noreply@movieflow.com"
      );

      if (result) {
        return {
          success: true,
          message: "Doğrulama e-postası başarıyla gönderildi",
          email,
        };
      } else {
        return {
          success: false,
          message: "Doğrulama e-postası gönderilemedi",
        };
      }
    } catch (error) {
      console.error("sendVerificationEmailToUser hata:", error);
      return {
        success: false,
        message: "Bir hata oluştu",
      };
    }
  }

  /**
   * Kullanıcının e-posta doğrulama kodunu kontrol eder
   * @param email - Kullanıcının e-posta adresi
   * @param code - Doğrulama kodu
   * @returns Promise<{success: boolean, message: string, email?: string}>
   */
  static async verifyUserEmail(
    email: string,
    code: string
  ): Promise<{ success: boolean; message: string; email?: string }> {
    try {
      // E-posta ile kullanıcıyı bul
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          message: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı",
        };
      }

      // Doğrulama kodu varlığını kontrol et
      if (!user.verificationCode) {
        return {
          success: false,
          message:
            "Bu e-posta için doğrulama kodu bulunamadı. Lütfen yeni bir kod talep edin.",
        };
      }

      // Kodun daha önce kullanılıp kullanılmadığını kontrol et
      if (user.verificationCodeUsed) {
        return {
          success: false,
          message: "Bu doğrulama kodu daha önce kullanılmış",
        };
      }

      // Kodun süresinin dolup dolmadığını kontrol et
      const now = new Date();
      if (
        user.verificationCodeExpiresAt &&
        now > user.verificationCodeExpiresAt
      ) {
        return {
          success: false,
          message:
            "Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep edin.",
        };
      }

      // Kodun eşleşip eşleşmediğini kontrol et
      if (user.verificationCode !== code) {
        return {
          success: false,
          message: "Geçersiz doğrulama kodu",
        };
      }

      // Kullanıcı doğrulama durumunu güncelle
      await prisma.user.update({
        where: { email },
        data: {
          isVerified: true,
          verificationCodeUsed: true,
        },
      });

      return {
        success: true,
        message: "E-posta başarıyla doğrulandı",
        email,
      };
    } catch (error) {
      console.error("verifyUserEmail hata:", error);
      return {
        success: false,
        message: "Bir hata oluştu",
      };
    }
  }

  static async sendEmailWithDynamicFrom(
    to: string,
    subject: string,
    html: string,
    fromName: string,
    fromEmail: string
  ) {
    console.log("Sending email with dynamic from address:", fromEmail);

    // Get the logo path
    const logoPath = path.join(process.cwd(), "public", "temp", "logo.jpg");
    let attachments = [];

    // Check if logo exists
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: "logo.jpg",
        path: logoPath,
        cid: "logo", // Content ID to reference in the HTML
      });
    } else {
      console.warn("Logo file not found at:", logoPath);
    }

    const mailOptions = {
      from: `"${fromName}" <${process.env.SMTP_USER}>`, // Use SMTP_USER as the actual sender but display fromName
      to,
      subject,
      html,
      attachments,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully with messageId:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  static generateVerificationEmail(
    username: string,
    verificationCode: string
  ): string {
    const baseUrl = process.env.APP_URL || "http://localhost:3000";

    const logoPath = `https://media.licdn.com/dms/image/v2/D4D0BAQH79hdedK8kCQ/company-logo_100_100/company-logo_100_100/0/1712151935277/onlyjs_technology_logo?e=1750896000&v=beta&t=Ijh6xb1_MYKrvcW6Z5TvxHxy1skt4c5a3vKrZCip1nU`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #1a1a1a;
          color: white;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: transparent;
          padding: 10px 0;
          display: flex;
          align-items: center;
        }
        .logo {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          color: white;
          text-align: center;
          line-height: 50px;
          margin-right: 10px;
          background: url(${logoPath}) no-repeat center center;
          overflow: hidden;
        }
        .header-text {
          font-size: 18px;
          font-weight: bold;
        }
        .content {
          padding: 20px 0;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
        }
        .verification-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          background-color: #333;
          padding: 15px 20px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
          color: #4CAF50;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
           <img src=${logoPath} 
      alt="MovieFlow" 
      style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div class="header-text">MovieFlow</div>
        </div>

        <div class="content">
          <h1>E-posta Adresinizi Doğrulayın</h1>
          <p>Merhaba ${username},</p>
          <p>Hesabınızı tamamlamak için lütfen e-posta adresinizi doğrulayın.</p>
          <p>Doğrulama kodunuz:</p>
          
          <div class="verification-code">${verificationCode}</div>
          
          <p>İşlemi tamamlamak için bu kodu doğrulama sayfasına girin.</p>
          <p>Bu kod 12 saat içinde geçerliliğini yitirecektir.</p>
          <p>Eğer bu doğrulama talebini siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} MovieFlow. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}
