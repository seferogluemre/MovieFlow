import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
  debug: true,
  logger: true,
});

export const verifyMailConnection = async (): Promise<boolean> => {
  try {
    const verification = await mailTransporter.verify();
    console.log("SMTP connection verified successfully:", verification);
    return true;
  } catch (error) {
    console.error("SMTP connection verification failed:", error);
    return false;
  }
};
