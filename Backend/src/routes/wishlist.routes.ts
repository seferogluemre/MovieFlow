import { Router } from "express";
import { WishlistController } from "src/controller/wishlist.controller";
import { listLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

// Apply list-specific rate limiter
router.use(listLimiter);

router.get("/", WishlistController.getAll);
router.post("/", WishlistController.create);
router.get("/:id", WishlistController.getById);
router.get("/user/:userId", WishlistController.getById);
router.delete("/:id", WishlistController.delete);

export default router;
