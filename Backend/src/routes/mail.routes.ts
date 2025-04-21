import {
  sendVerificationEmail,
  verificationCodes,
  verifyEmail,
} from "@/controller/mail.controller";
import { Request, Response, Router } from "express";

const router = Router();

router.post("/send", sendVerificationEmail);
router.post("/verify-email", verifyEmail);

// Debug endpoint to see all stored verification codes
router.get("/debug/codes", (req: Request, res: Response) => {
  const codes = Array.from(verificationCodes.entries()).map(
    ([email, data]) => ({
      email,
      code: data.code,
      expires: data.expires,
    })
  );

  res.json({
    count: codes.length,
    codes,
  });
});

// Debug endpoint to manually add a code (for testing only, remove in production)
router.post("/debug/add-code", (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  // Create expiration time (12 hours from now)
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 12);

  // Store the code
  verificationCodes.set(email, {
    code,
    expires: expirationTime,
  });

  res.json({
    message: "Verification code added successfully",
    email,
    code,
    expires: expirationTime,
  });
});

export default router;
