import { Router } from "express";
import { GenreController } from "../controller/genre.controller";
import { genreLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

// Apply genre-specific rate limiter
router.use(genreLimiter);

// Genre CRUD routes
router.get("/", GenreController.index);
router.get("/:id", GenreController.get);
router.post("/", GenreController.create);
router.get("/slug/:slug", GenreController.getBySlug);
router.patch("/:id", GenreController.update);
router.delete("/:id", GenreController.delete);

// Movie-Genre relationship routes
router.post("/:genreId/movie/:movieId", GenreController.addMovie);
router.delete("/:genreId/movie/:movieId", GenreController.removeMovie);
router.get("/:genreId/movie", GenreController.getMovies);

export default router;
