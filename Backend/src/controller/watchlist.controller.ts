import { Request, Response } from "express";
import { WatchlistService } from "../services/watchlist.service";
import {
  createWatchlistSchema,
  updateWatchlistSchema,
} from "../validators/watchlist.validator";

export class WatchListController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const validatedData = createWatchlistSchema.parse(req.body);

      const watchlist = await WatchlistService.create(
        Number(userId),
        validatedData
      );
      res.status(201).json(watchlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const watchlists = await WatchlistService.getAll(Number(userId));
      res.json(watchlists);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const id = parseInt(req.params.id);

      const watchlist = await WatchlistService.getById(Number(userId), id);
      if (!watchlist) {
        res.status(404).json({ error: "Watchlist not found" });
      }

      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const id = parseInt(req.params.id);
      const validatedData = updateWatchlistSchema.parse(req.body);

      const watchlist = await WatchlistService.update(
        Number(userId),
        id,
        validatedData
      );
      if (!watchlist) {
        res.status(404).json({ error: "Watchlist not found" });
      }

      res.json(watchlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const id = parseInt(req.params.id);

      await WatchlistService.delete(Number(userId), id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
