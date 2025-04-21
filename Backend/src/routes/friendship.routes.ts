import { FriendshipController } from "@controllers/friendship.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.use(authenticate);

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
