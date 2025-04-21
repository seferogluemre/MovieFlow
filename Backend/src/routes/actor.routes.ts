import { ActorController } from "@controllers/actor.controller";
import { Router } from "express";

const router = Router();

router.get("/", ActorController.index);
router.get("/:id", ActorController.get);
router.post("/", ActorController.create);
router.patch("/:id", ActorController.update);
router.delete("/:id", ActorController.delete);

export default router;
