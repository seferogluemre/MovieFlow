import { Router } from "express";
import { LibraryController } from "../controller/library.controller";
import { authMiddleware } from "src/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

// Library routes
router.post("/", LibraryController.create);
router.get("/", LibraryController.getAll);
router.get("/:id", LibraryController.getById);
router.patch("/:id", LibraryController.update);
router.delete("/:id", LibraryController.delete);

export default router;
