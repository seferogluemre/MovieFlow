import { Router } from "express";
import { authenticate } from "src/middlewares/auth.middleware";
import { NotificationController } from "../controller/notification.controller";

const router = Router();

router.get("/", authenticate, NotificationController.getUserNotifications);
router.patch("/:id/read", authenticate, NotificationController.markAsRead);
router.patch("/read-all", authenticate, NotificationController.markAllAsRead);
router.delete("/:id", authenticate, NotificationController.deleteNotification);

export default router;
