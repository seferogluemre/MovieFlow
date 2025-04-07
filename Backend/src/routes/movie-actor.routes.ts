import { Router } from "express";
import { MovieActorController } from "../controller/movie-actor.controller";

const router = Router();

// MovieActor routes
router.post("/", MovieActorController.create);
router.get("/", MovieActorController.getAll);
router.get("/movie/:movieId", MovieActorController.getByMovieId);
router.get("/actor/:actorId", MovieActorController.getByActorId);
router.patch("/:movieId/:actorId", MovieActorController.update);
router.delete("/:movieId/:actorId", MovieActorController.delete);

export default router;
