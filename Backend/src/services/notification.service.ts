import { NotificationType } from "@prisma/client";
import prisma from "src/config/database";

export class NotificationService {
  static async create(
    userId: number,
    fromUserId: number,
    type: NotificationType,
    message: string,
    metadata?: Record<string, any>
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        fromUserId,
        type,
        message,
        metadata: metadata || {},
      },
      include: {
        user: true,
        fromUser: true,
      },
    });
    await prisma.$disconnect();
    return notification;
  }

  static async getUserNotifications(userId: number) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        user: true,
        fromUser: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    await prisma.$disconnect();
    return notifications;
  }

  static async markAsRead(notificationId: number) {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    await prisma.$disconnect();
    return notification;
  }

  static async markAllAsRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    await prisma.$disconnect();
  }
}
