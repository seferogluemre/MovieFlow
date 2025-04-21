import { EmailService } from "@/services/mail.service";
import {
  createVerificationData,
  generateVerificationCode,
  isValidVerificationCode,
} from "@/utils/mail";
import { Request, Response } from "express";

// In-memory store of verification codes (in a real app, this would be in a database)
export const verificationCodes = new Map<
  string,
  { code: string; expires: Date }
>();

export const sendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, username, fromName, fromEmail } = req.body;

  if (!email || !username || !fromName || !fromEmail) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const verificationCode = generateVerificationCode();
    console.log(`Generated verification code ${verificationCode} for ${email}`);

    // Use the utility function to create verification data
    const verificationData = createVerificationData(verificationCode);
    verificationCodes.set(email, verificationData);

    console.log(
      `Stored code in memory. Current codes: ${verificationCodes.size}`
    );
    verificationCodes.forEach((value, key) => {
      console.log(
        `Stored: Email: ${key}, Code: ${value.code}, Expires: ${value.expires}`
      );
    });

    const htmlContent = EmailService.generateVerificationEmail(
      username,
      verificationCode
    );

    const result = await EmailService.sendEmailWithDynamicFrom(
      email,
      "Welcome to Our OnlyJS Movie Platform!",
      htmlContent,
      fromName,
      fromEmail
    );

    if (result) {
      const storedCode = verificationCodes.get(email);
      console.log(
        `After email sent, code for ${email}: ${
          storedCode ? storedCode.code : "not found"
        }`
      );

      res.status(200).json({
        message: "Email sent successfully",
        email,
        code: verificationCode,
      });
    } else {
      res.status(500).json({ message: "Failed to send email" });
    }
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, code } = req.body;

  if (!email || !code) {
    res
      .status(400)
      .json({ message: "Email and verification code are required" });
    return;
  }

  // Validate code format first
  if (!isValidVerificationCode(code)) {
    res.status(400).json({ message: "Invalid verification code format" });
    return;
  }

  verificationCodes.forEach((value, key) => {
    console.log(
      `Email: ${key}, Code: ${value.code}, Expires: ${value.expires}`
    );
  });

  const verificationData = verificationCodes.get(email);

  if (!verificationData) {
    res.status(404).json({
      message: "Verification code not found for this email",
      email,
      availableEmails: Array.from(verificationCodes.keys()),
    });
    return;
  }

  const now = new Date();
  if (now > verificationData.expires) {
    verificationCodes.delete(email);
    res.status(400).json({ message: "Verification code has expired" });
    return;
  }

  if (verificationData.code !== code) {
    res.status(400).json({ message: "Invalid verification code" });
    return;
  }

  verificationCodes.delete(email);

  res.status(200).json({
    message: "Email verified successfully",
    email,
  });
};
