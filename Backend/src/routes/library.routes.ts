import { Router } from "express";
import { authenticate } from "src/middlewares/auth.middleware";
import { LibraryController } from "../controller/library.controller";
import { libraryLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();

router.use(authenticate);

// Apply library-specific rate limiter
router.use(libraryLimiter);

// Library routes
router.post("/", LibraryController.create);
router.get("/", LibraryController.getAll);
router.get("/user/:userId", LibraryController.getAllByUserId);
router.get("/:id", LibraryController.getById);
router.patch("/:id", LibraryController.update);
router.delete("/:id", LibraryController.delete);

export default router;
