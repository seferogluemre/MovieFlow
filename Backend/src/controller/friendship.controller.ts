import { Request, Response } from "express";
import { FriendshipService } from "../services/friendship.service";
import {
  CreateFriendshipType,
  UpdateFriendshipType,
} from "../validators/friendship.validation";
import { logInfo, logWarn } from "src/utils/logging/logger.util";

export class FriendshipController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship create ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }

      const data = req.body as CreateFriendshipType;
      const friendship = await FriendshipService.create(Number(userId), data);

      logInfo("Friendship create ---- Friendship request sent successfully");
      res.status(201).json(friendship);
    } catch (error) {
      logWarn("Friendship create ---- Error sending friendship request");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship getAll ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }

      const friendships = await FriendshipService.getAll(Number(userId));

      logInfo("Friendship getAll ---- Retrieved all friendships");
      res.json(friendships);
    } catch (error) {
      logWarn("Friendship getAll ---- Error retrieving friendships");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship getById ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const friendship = await FriendshipService.getById(Number(id));

      if (!friendship) {
        logWarn("Friendship getById ---- Friendship not found");
        res.status(404).json({ message: "Friendship not found" });
      }

      if (friendship?.userId !== userId && friendship?.friendId !== userId) {
        logWarn("Friendship getById ---- Unauthorized access attempt");
        res.status(403).json({ message: "Forbidden" });
      }

      logInfo("Friendship getById ---- Retrieved friendship");
      res.json(friendship);
    } catch (error) {
      logWarn("Friendship getById ---- Error retrieving friendship");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship update ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const data = req.body as UpdateFriendshipType;
      const friendship = await FriendshipService.update(Number(id), data);

      if (!friendship) {
        logWarn("Friendship update ---- Friendship not found");
        res.status(404).json({ message: "Friendship not found" });
      }

      if (friendship.friendId !== userId) {
        logWarn("Friendship update ---- Unauthorized access attempt");
        res.status(403).json({ message: "Forbidden" });
      }

      logInfo("Friendship update ---- Friendship status updated successfully");
      res.json(friendship);
    } catch (error) {
      logWarn("Friendship update ---- Error updating friendship status");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship delete ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const friendship = await FriendshipService.getById(Number(id));

      if (!friendship) {
        logWarn("Friendship delete ---- Friendship not found");
        res.status(404).json({ message: "Friendship not found" });
      }

      if (friendship?.userId !== userId && friendship?.friendId !== userId) {
        logWarn("Friendship delete ---- Unauthorized access attempt");
        res.status(403).json({ message: "Forbidden" });
      }

      await FriendshipService.delete(Number(id));

      logInfo("Friendship delete ---- Friendship deleted successfully");
      res.status(204).send();
    } catch (error) {
      logWarn("Friendship delete ---- Error deleting friendship");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn(
          "Friendship getPendingRequests ---- Unauthorized access attempt"
        );
        res.status(401).json({ message: "Unauthorized" });
      }

      const pendingRequests = await FriendshipService.getPendingRequests(
        Number(userId)
      );

      logInfo(
        "Friendship getPendingRequests ---- Retrieved pending friendship requests"
      );
      res.json(pendingRequests);
    } catch (error) {
      logWarn(
        "Friendship getPendingRequests ---- Error retrieving pending requests"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
