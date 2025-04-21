import { MovieController } from "@controllers/movie.controller";
import { Router } from "express";

const router = Router();

router.get("/", MovieController.index);
router.post("/", MovieController.create);
router.get("/:id", MovieController.get);
router.get("/posters/:id", MovieController.getPicture);
router.patch("/:id", MovieController.update);
router.delete("/:id", MovieController.delete);

export default router;
