import { Router } from "express";
import { WishlistController } from "src/controller/wishlist.controller";
import { authenticate } from "src/middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, WishlistController.getAll);
router.post("/", authenticate, WishlistController.create);
router.get("/:id", authenticate, WishlistController.getById);
router.get("/user/:userId", authenticate, WishlistController.getById);
router.delete("/:id", authenticate, WishlistController.delete);

export default router;
