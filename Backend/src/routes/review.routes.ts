import { Router } from "express";
import { ReviewController } from "src/controller/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.get("/", ReviewController.index);
router.get("/:id", ReviewController.get);
router.get("/movie/:movieId", ReviewController.getMovieReviews);

// Protected routes
router.post("/", authMiddleware, ReviewController.create);
router.put("/:id", authMiddleware, ReviewController.update);
router.delete("/:id", authMiddleware, ReviewController.delete);
router.get("/user/reviews", authMiddleware, ReviewController.getUserReviews);

export default router;
