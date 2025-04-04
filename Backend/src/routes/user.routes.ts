import { Router } from "express";
import { UserController } from "src/controller/user.controller";

const router = Router();

router.get('/', UserController.index)
router.post('/', UserController.create)
router.get('/:id', UserController.get)
router.patch('/:id', UserController.update)
router.delete('/:id', UserController.delete)

export default router;