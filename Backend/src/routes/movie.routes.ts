import { Router } from "express";
import { MovieController } from "src/controller/movie.controller";

const router = Router();


router.get('/', MovieController.index)
router.post('/', MovieController.create)
router.get('/:id', MovieController.get)
router.get('/posters/:id', MovieController.getProfile)


export default router;