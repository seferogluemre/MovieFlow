import { Router } from "express";
import { UserController } from "src/controller/user.controller";

const router = Router();

router.post('/', UserController.create)





export default router;