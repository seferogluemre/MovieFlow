import { GenreController } from "@controllers/genre.controller";
import { Router } from "express";

const router = Router();

// Genre CRUD routes
router.get("/", GenreController.index);
router.get("/:id", GenreController.get);
router.post("/", GenreController.create);
router.patch("/:id", GenreController.update);
router.delete("/:id", GenreController.delete);

// Movie-Genre relationship routes
router.post("/:genreId/movie/:movieId", GenreController.addMovie);
router.delete("/:genreId/movie/:movieId", GenreController.removeMovie);
router.get("/:genreId/movie", GenreController.getMovies);

export default router;
