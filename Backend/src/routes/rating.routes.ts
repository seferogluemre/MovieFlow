import { Router } from "express";
import { authenticate } from "src/middlewares/auth.middleware";
import { RatingController } from "../controller/rating.controller";
import { ratingLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

// Apply rating-specific rate limiter
router.use(ratingLimiter);

// Public routes
router.get("/", RatingController.index);
router.get("/:id", RatingController.get);
router.get("/movie/:movieId", RatingController.getMovieRatings);
router.get("/movie/:movieId/average", RatingController.getMovieAverageRating);

// Protected routes
router.post("/", authenticate, RatingController.create);
router.patch("/:id", authenticate, RatingController.update);
router.delete("/:id", authenticate, RatingController.delete);
router.get("/user/ratings", authenticate, RatingController.getUserRatings);

export default router;
