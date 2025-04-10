import { Router } from "express";
import { LibraryController } from "../controller/library.controller";
import { authenticate } from "src/middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Library routes
router.post("/", LibraryController.create);
router.get("/", LibraryController.getAll);
router.get("/user/:userId", LibraryController.getAllByUserId);
router.get("/:id", LibraryController.getById);
router.patch("/:id", LibraryController.update);
router.delete("/:id", LibraryController.delete);

export default router;
