import { Router } from "express";
import { ActorController } from "../controller/actor.controller";
import { actorLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.use(actorLimiter);

router.get("/", ActorController.index);
router.get("/:id", ActorController.get);
router.post("/", ActorController.create);
router.patch("/:id", ActorController.update);
router.delete("/:id", ActorController.delete);

export default router;
