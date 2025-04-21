import { mailTransporter, verifyMailConnection } from "@/config/mail.config";
import { generateVerificationCode } from "@/utils/mail";
import fs from "fs";
import path from "path";

export class EmailService {
  // Use the transporter from config
  static transporter = mailTransporter;

  // Use the generateVerificationCode from utils
  static generateVerificationCode = generateVerificationCode;

  // Use the verifyConnection function from config
  static verifyConnection = verifyMailConnection;

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
      alt="OnlyJS MOVIE PLATFORM" 
      style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div class="header-text">OnlyJS MOVIE PLATFORM</div>
        </div>

        <div class="content">
          <h1>Welcome to Our OnlyJS Movie Platform!</h1>
          <p>Hi ${username},</p>
          <p>Thank you for joining our platform. We're excited to have you here!</p>
          <p>To verify your email address, please use the verification code below:</p>
          
          <div class="verification-code">${verificationCode}</div>
          
          <p>Enter this code on the verification page to complete your registration.</p>
          <p>This code will expire in 12 hours.</p>
        </div>

        <div class="footer">
          <p>© 2025 OnlyJS Movie Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}
