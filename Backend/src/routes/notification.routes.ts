import { NotificationController } from "@controllers/notification.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.get("/", authenticate, NotificationController.getUserNotifications);
router.patch("/:id/read", authenticate, NotificationController.markAsRead);
router.patch("/read-all", authenticate, NotificationController.markAllAsRead);
router.delete("/:id", authenticate, NotificationController.deleteNotification);

export default router;
