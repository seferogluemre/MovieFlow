import { Router } from "express";
import { ActorController } from "src/controller/actor.controller";

const router = Router();

router.get("/", ActorController.index);
router.get("/:id", ActorController.get);
router.post("/", ActorController.create);
router.patch("/:id", ActorController.update);
router.delete("/:id", ActorController.delete);

export default router;
