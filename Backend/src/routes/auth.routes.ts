import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { authLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.use(authLimiter);

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

export default router;
