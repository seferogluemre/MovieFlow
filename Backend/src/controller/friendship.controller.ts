import { Request, Response } from "express";
import { logInfo, logWarn } from "src/utils/logging/logger.util";
import { FriendshipService } from "../services/friendship.service";
import {
  CreateFriendshipType,
  UpdateFriendshipType,
} from "../validators/friendship.validation";

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

  static async getSentRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship getSentRequests ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const sentRequests = await FriendshipService.getSentRequests(
        Number(userId)
      );

      logInfo(
        "Friendship getSentRequests ---- Retrieved sent friendship requests"
      );
      res.json(sentRequests);
    } catch (error) {
      logWarn("Friendship getSentRequests ---- Error retrieving sent requests");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async followUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship followUser ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { targetUserId } = req.params;

      if (Number(userId) === Number(targetUserId)) {
        logWarn("Friendship followUser ---- User tried to follow themselves");
        res.status(400).json({ message: "You cannot follow yourself" });
        return;
      }

      const friendship = await FriendshipService.followUser(
        Number(userId),
        Number(targetUserId)
      );

      logInfo("Friendship followUser ---- User followed successfully");
      res.status(200).json(friendship);
    } catch (error: any) {
      logWarn(`Friendship followUser ---- Error: ${error.message}`);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }

  static async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship unfollowUser ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { targetUserId } = req.params;

      if (Number(userId) === Number(targetUserId)) {
        logWarn(
          "Friendship unfollowUser ---- User tried to unfollow themselves"
        );
        res.status(400).json({ message: "Invalid operation" });
        return;
      }

      const result = await FriendshipService.unfollowUser(
        Number(userId),
        Number(targetUserId)
      );

      logInfo("Friendship unfollowUser ---- User unfollowed successfully");
      res.status(200).json(result);
    } catch (error: any) {
      logWarn(`Friendship unfollowUser ---- Error: ${error.message}`);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }

  static async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship getFollowers ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { targetUserId } = req.params;
      const userIdToQuery = targetUserId
        ? Number(targetUserId)
        : Number(userId);

      const followers = await FriendshipService.getFollowers(userIdToQuery);

      logInfo("Friendship getFollowers ---- Retrieved followers successfully");
      res.status(200).json(followers);
    } catch (error: any) {
      logWarn(`Friendship getFollowers ---- Error: ${error.message}`);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }

  static async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship getFollowing ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { targetUserId } = req.params;
      const userIdToQuery = targetUserId
        ? Number(targetUserId)
        : Number(userId);

      const following = await FriendshipService.getFollowing(userIdToQuery);

      logInfo(
        "Friendship getFollowing ---- Retrieved following users successfully"
      );
      res.status(200).json(following);
    } catch (error: any) {
      logWarn(`Friendship getFollowing ---- Error: ${error.message}`);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }

  static async getMutualFriends(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("Friendship getMutualFriends ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { targetUserId } = req.params;
      const userIdToQuery = targetUserId
        ? Number(targetUserId)
        : Number(userId);

      const mutualFriends = await FriendshipService.getMutualFriends(
        userIdToQuery
      );

      logInfo(
        "Friendship getMutualFriends ---- Retrieved mutual friends successfully"
      );
      res.status(200).json(mutualFriends);
    } catch (error: any) {
      logWarn(`Friendship getMutualFriends ---- Error: ${error.message}`);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }

  static async getRelationshipStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn(
          "Friendship getRelationshipStatus ---- Unauthorized access attempt"
        );
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { targetUserId } = req.params;

      if (!targetUserId) {
        logWarn("Friendship getRelationshipStatus ---- Missing target user ID");
        res.status(400).json({ message: "Target user ID is required" });
        return;
      }

      const status = await FriendshipService.getRelationshipStatus(
        Number(userId),
        Number(targetUserId)
      );

      logInfo(
        "Friendship getRelationshipStatus ---- Retrieved relationship status successfully"
      );
      res.status(200).json(status);
    } catch (error: any) {
      logWarn(`Friendship getRelationshipStatus ---- Error: ${error.message}`);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  }
}
