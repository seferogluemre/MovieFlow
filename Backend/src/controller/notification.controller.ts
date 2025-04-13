import { Request, Response } from "express";
import { logInfo, logWarn } from "src/utils/logging/logger.util";
import { NotificationService } from "../services/notification.service";

export class NotificationController {
  static async getUserNotifications(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn(
          "Notification getUserNotifications ---- Unauthorized access attempt"
        );
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const notifications = await NotificationService.getUserNotifications(
        Number(userId)
      );
      logInfo(
        "Notification getUserNotifications ---- Retrieved user notifications"
      );
      res.json(notifications);
    } catch (error) {
      logWarn(
        "Notification getUserNotifications ---- Error retrieving notifications"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Notification markAsRead ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      const notification = await NotificationService.markAsRead(Number(id));
      logInfo("Notification markAsRead ---- Notification marked as read");
      res.json(notification);
    } catch (error) {
      logWarn(
        "Notification markAsRead ---- Error marking notification as read"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Notification markAllAsRead ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      await NotificationService.markAllAsRead(Number(userId));
      logInfo(
        "Notification markAllAsRead ---- All notifications marked as read"
      );
      res.status(204).send();
    } catch (error) {
      logWarn(
        "Notification markAllAsRead ---- Error marking all notifications as read"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn(
          "Notification deleteNotification ---- Unauthorized access attempt"
        );
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      await NotificationService.deleteNotification(Number(id));
      logInfo("Notification deleteNotification ---- Notification deleted");
      res.status(204).send();
    } catch (error) {
      logWarn(
        "Notification deleteNotification ---- Error deleting notification"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
