import {
  sendVerificationEmail,
  verifyEmail,
} from "@/controller/mail.controller";
import { Router } from "express";

const router = Router();

router.post("/send", sendVerificationEmail);
router.post("/verify-email", verifyEmail);

export default router;
