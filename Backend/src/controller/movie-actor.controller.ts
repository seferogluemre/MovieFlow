import { MovieActorService } from "@services/movie-actor.service";
import { logInfo, logWarn } from "@utils/logging/logger.util";
import {
  CreateMovieActorType,
  UpdateMovieActorType,
} from "@validators/movie-actor.validation";
import { Request, Response } from "express";

export class MovieActorController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateMovieActorType;
      const movieActor = await MovieActorService.create(data);

      logInfo(
        "MovieActor create ---- Movie-actor relationship created successfully"
      );
      res.status(201).json(movieActor);
    } catch (error) {
      logWarn("MovieActor create ---- Error creating movie-actor relationship");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const movieActors = await MovieActorService.getAll();

      logInfo("MovieActor getAll ---- Retrieved all movie-actor relationships");
      res.json(movieActors);
    } catch (error) {
      logWarn(
        "MovieActor getAll ---- Error retrieving movie-actor relationships"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getByMovieId(req: Request, res: Response): Promise<void> {
    try {
      const { movieId } = req.params;
      const movieActors = await MovieActorService.getByMovieId(Number(movieId));

      if (!movieActors.length) {
        logWarn("MovieActor getByMovieId ---- No actors found for movie");
        res.status(404).json({ message: "No actors found for this movie" });
      }

      logInfo("MovieActor getByMovieId ---- Retrieved actors for movie");
      res.json(movieActors);
    } catch (error) {
      logWarn("MovieActor getByMovieId ---- Error retrieving actors for movie");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getByActorId(req: Request, res: Response): Promise<void> {
    try {
      const { actorId } = req.params;
      const movieActors = await MovieActorService.getByActorId(Number(actorId));

      if (!movieActors.length) {
        logWarn("MovieActor getByActorId ---- No movies found for actor");
        res.status(404).json({ message: "No movies found for this actor" });
      }

      logInfo("MovieActor getByActorId ---- Retrieved movies for actor");
      res.json(movieActors);
    } catch (error) {
      logWarn("MovieActor getByActorId ---- Error retrieving movies for actor");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { movieId, actorId } = req.params;
      const data = req.body as UpdateMovieActorType;
      const movieActor = await MovieActorService.update(
        Number(movieId),
        Number(actorId),
        data
      );

      logInfo(
        "MovieActor update ---- Movie-actor relationship updated successfully"
      );
      res.json(movieActor);
    } catch (error) {
      logWarn("MovieActor update ---- Error updating movie-actor relationship");
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { movieId, actorId } = req.params;
      await MovieActorService.delete(Number(movieId), Number(actorId));

      logInfo(
        "MovieActor delete ---- Movie-actor relationship deleted successfully"
      );
      res.status(204).send();
    } catch (error) {
      logWarn("MovieActor delete ---- Error deleting movie-actor relationship");
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
