import { Router } from "express";
import { authenticate } from "src/middlewares/auth.middleware";
import { ReviewController } from "../controller/review.controller";

const router = Router();

// Public routes
router.get("/", ReviewController.index);
router.get("/:id", ReviewController.get);
router.get("/movie/:movieId", ReviewController.getMovieReviews);

// Protected routes
router.post("/", authenticate, ReviewController.create);
router.patch("/:id", authenticate, ReviewController.update);
router.delete("/:id", authenticate, ReviewController.delete);
router.get("/user/reviews", authenticate, ReviewController.getUserReviews);

export default router;
