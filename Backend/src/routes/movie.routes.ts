import { Router } from "express";
import { MovieController } from "../controller/movie.controller";
import { movieLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

// Apply movie-specific rate limiter with higher limits for browsing
router.use(movieLimiter);

router.get("/", MovieController.index);
router.post("/", MovieController.create);
router.get("/:id", MovieController.get);
router.get("/posters/:id", MovieController.getPicture);
router.patch("/:id", MovieController.update);
router.delete("/:id", MovieController.delete);

export default router;
