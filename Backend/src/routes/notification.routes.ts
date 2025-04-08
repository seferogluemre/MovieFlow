import express from "express";
import { NotificationController } from "../controller/notification.controller";
import { authenticate } from "src/middlewares/auth.middleware";

const router = express.Router();

router.get("/", authenticate, NotificationController.getUserNotifications);
router.patch("/:id/read", authenticate, NotificationController.markAsRead);
router.patch("/read-all", authenticate, NotificationController.markAllAsRead);

export default router; 