import { Router } from "express";
import { authenticate } from "src/middlewares/auth.middleware";
import { NotificationController } from "../controller/notification.controller";
import { notificationLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

// Apply notification-specific rate limiter
router.use(notificationLimiter);

router.get("/", authenticate, NotificationController.getUserNotifications);
router.patch("/:id/read", authenticate, NotificationController.markAsRead);
router.patch("/read-all", authenticate, NotificationController.markAllAsRead);
router.delete("/:id", NotificationController.deleteNotification);

export default router;
