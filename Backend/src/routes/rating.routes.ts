import { Router } from "express";
import { RatingController } from "src/controller/rating.controller";
import { authMiddleware } from "src/middlewares/auth.middleware";

const router = Router();

// Public routes
router.get("/", RatingController.index);
router.get("/:id", RatingController.get);
router.get("/movie/:movieId", RatingController.getMovieRatings);
router.get("/movie/:movieId/average", RatingController.getMovieAverageRating);

// Protected routes
router.post("/", authMiddleware, RatingController.create);
router.put("/:id", authMiddleware, RatingController.update);
router.delete("/:id", authMiddleware, RatingController.delete);
router.get("/user/ratings", authMiddleware, RatingController.getUserRatings);

export default router;
