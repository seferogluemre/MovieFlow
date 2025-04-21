import { MovieGenreService } from "@services/movie-genre.service";
import { logInfo, logWarn } from "@utils/logging/logger.util";
import { CreateMovieGenreType } from "@validators/movie-genre.validation";
import { Request, Response } from "express";

export class MovieGenreController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateMovieGenreType;
      const movieGenre = await MovieGenreService.create(data);

      logInfo(
        "MovieGenre create ---- Movie-genre relationship created successfully"
      );
      res.status(201).json(movieGenre);
    } catch (error) {
      logWarn("MovieGenre create ---- Error creating movie-genre relationship");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const movieGenres = await MovieGenreService.getAll();

      logInfo("MovieGenre getAll ---- Retrieved all movie-genre relationships");
      res.json(movieGenres);
    } catch (error) {
      logWarn(
        "MovieGenre getAll ---- Error retrieving movie-genre relationships"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getByMovieId(req: Request, res: Response): Promise<void> {
    try {
      const { movieId } = req.params;
      const movieGenres = await MovieGenreService.getByMovieId(Number(movieId));

      if (!movieGenres.length) {
        logWarn("MovieGenre getByMovieId ---- No genres found for movie");
        res.status(404).json({ message: "No genres found for this movie" });
      }

      logInfo("MovieGenre getByMovieId ---- Retrieved genres for movie");
      res.json(movieGenres);
    } catch (error) {
      logWarn("MovieGenre getByMovieId ---- Error retrieving genres for movie");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getByGenreId(req: Request, res: Response): Promise<void> {
    try {
      const { genreId } = req.params;
      const movieGenres = await MovieGenreService.getByGenreId(Number(genreId));

      if (!movieGenres.length) {
        logWarn("MovieGenre getByGenreId ---- No movies found for genre");
        res.status(404).json({ message: "No movies found for this genre" });
      }

      logInfo("MovieGenre getByGenreId ---- Retrieved movies for genre");
      res.json(movieGenres);
    } catch (error) {
      logWarn("MovieGenre getByGenreId ---- Error retrieving movies for genre");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { movieId, genreId } = req.params;
      await MovieGenreService.delete(Number(movieId), Number(genreId));

      logInfo(
        "MovieGenre delete ---- Movie-genre relationship deleted successfully"
      );
      res.status(204).send();
    } catch (error) {
      logWarn("MovieGenre delete ---- Error deleting movie-genre relationship");
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
