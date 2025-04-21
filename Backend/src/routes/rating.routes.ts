import { RatingController } from "@controllers/rating.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

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
