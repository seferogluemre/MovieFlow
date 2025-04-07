import { Router } from "express";
import { AuthController } from "src/controller/auth.controller";

const router = Router();

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

export default router;
