import { Router } from "express";
import { FriendshipController } from "../controller/friendship.controller";
import { authMiddleware } from "src/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", FriendshipController.create);
router.get("/pending", FriendshipController.getPendingRequests);
router.get("/", FriendshipController.getAll);
router.get("/:id", FriendshipController.getById);
router.patch("/:id", FriendshipController.update);
router.delete("/:id", FriendshipController.delete);

export default router;
