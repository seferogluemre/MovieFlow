import { MovieController } from "@controllers/movie.controller";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Movie management endpoints
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get("/", MovieController.index);

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     responses:
 *       201:
 *         description: Movie created successfully
 */
router.post("/", MovieController.create);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie details
 */
router.get("/:id", MovieController.get);

/**
 * @swagger
 * /api/movies/posters/{id}:
 *   get:
 *     summary: Get a movie poster by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie poster
 */
router.get("/posters/:id", MovieController.getPicture);

/**
 * @swagger
 * /api/movies/{id}:
 *   patch:
 *     summary: Update a movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 */
router.patch("/:id", MovieController.update);

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     summary: Delete a movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 */
router.delete("/:id", MovieController.delete);

export default router;
