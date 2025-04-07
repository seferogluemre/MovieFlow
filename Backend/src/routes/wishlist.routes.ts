import { Router } from "express";
import { WishlistController } from "../controller/wishlist.controller";
import { authMiddleware } from "src/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", WishlistController.create);
router.get("/", WishlistController.getAll);
router.get("/:id", WishlistController.getById);
router.patch("/:id", WishlistController.update);
router.delete("/:id", WishlistController.delete);

export default router;
