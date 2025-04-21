import { LibraryController } from "@controllers/library.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.use(authenticate);

router.post("/", LibraryController.create);
router.get("/", LibraryController.getAll);
router.get("/user/:userId", LibraryController.getAllByUserId);
router.get("/:id", LibraryController.getById);
router.patch("/:id", LibraryController.update);
router.delete("/:id", LibraryController.delete);

export default router;
