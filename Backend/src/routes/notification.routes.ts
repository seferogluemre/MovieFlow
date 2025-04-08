import express from "express";
import { NotificationController } from "../controller/notification.controller";
import { authenticate } from "src/middlewares/auth.middleware";

const router = express.Router();

router.get("/", authenticate, NotificationController.getUserNotifications);
router.put("/:id/read", authenticate, NotificationController.markAsRead);
router.put("/read-all", authenticate, NotificationController.markAllAsRead);

export default router; 