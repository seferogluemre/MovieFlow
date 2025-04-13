import { Router } from "express";
import { authenticate } from "src/middlewares/auth.middleware";
import { FriendshipController } from "../controller/friendship.controller";
import { friendshipLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.use(authenticate);
router.use(friendshipLimiter);

router.post("/", FriendshipController.create);
router.get("/pending", FriendshipController.getPendingRequests);
router.get("/sent", FriendshipController.getSentRequests);
router.get("/", FriendshipController.getAll);
router.get("/:id", FriendshipController.getById);
router.patch("/:id", FriendshipController.update);
router.delete("/:id", FriendshipController.delete);

router.post("/follow/:targetUserId", FriendshipController.followUser);
router.delete("/follow/:targetUserId", FriendshipController.unfollowUser);
router.get("/followers", FriendshipController.getFollowers);
router.get("/followers/:targetUserId", FriendshipController.getFollowers);
router.get("/following", FriendshipController.getFollowing);
router.get("/following/:targetUserId", FriendshipController.getFollowing);
router.get("/mutual", FriendshipController.getMutualFriends);
router.get("/mutual/:targetUserId", FriendshipController.getMutualFriends);
router.get("/status/:targetUserId", FriendshipController.getRelationshipStatus);

export default router;
