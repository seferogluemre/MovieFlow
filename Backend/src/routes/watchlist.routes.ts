import { Router } from "express";
import { WatchListController } from "src/controller/watchlist.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { listLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.use(authenticate);

// Apply list-specific rate limiter
router.use(listLimiter);

router.post("/", WatchListController.create);
router.get("/", WatchListController.getAll);
router.get("/:id", WatchListController.getById);
router.patch("/:id", WatchListController.update);
router.delete("/:id", WatchListController.delete);

export default router;
