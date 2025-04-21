import { WishlistController } from "@controllers/wishlist.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.get("/", authenticate, WishlistController.getAll);
router.post("/", authenticate, WishlistController.create);
router.get("/:id", authenticate, WishlistController.getById);
router.get("/user/:userId", authenticate, WishlistController.getById);
router.delete("/:id", authenticate, WishlistController.delete);

export default router;
