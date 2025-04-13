import { Router } from "express";
import { WishListController } from "../controller/wishlist.controller";
import { listLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

// Apply list-specific rate limiter
router.use(listLimiter);

router.get("/", WishListController.index);
router.post("/", WishListController.create);
router.get("/:id", WishListController.get);
router.get("/user/:userId", WishListController.getByUserId);
router.delete("/:id", WishListController.delete);

export default router;
