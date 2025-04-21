import { UserController } from "@controllers/user.controller";
import { Router } from "express";
import multer from "multer";
import { storage } from "../config/multer";

const upload = multer({ storage });
const router = Router();

router.get("/", UserController.index);
router.post(
  "/upload/:id",
  upload.single("profileImage"),
  UserController.upload
);
router.post("/", UserController.create);
router.get("/:id", UserController.get);
router.patch("/:id", UserController.update);
router.delete("/:id", UserController.delete);

export default router;
