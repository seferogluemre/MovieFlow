import { Router } from "express";
import { MovieGenreController } from "../controller/movie-genre.controller";

const router = Router();

// MovieGenre routes
router.post("/", MovieGenreController.create);
router.get("/", MovieGenreController.getAll);
router.get("/movie/:movieId", MovieGenreController.getByMovieId);
router.get("/genre/:genreId", MovieGenreController.getByGenreId);
router.delete("/:movieId/:genreId", MovieGenreController.delete);

export default router;
