import { WatchListController } from "@controllers/watchlist.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.use(authenticate);

router.post("/", WatchListController.create);
router.get("/", WatchListController.getAll);
router.get("/:id", WatchListController.getById);
router.patch("/:id", WatchListController.update);
router.delete("/:id", WatchListController.delete);

export default router;
