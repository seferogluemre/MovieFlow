import { WishlistService } from "@services/wishlist.service";
import {
  createWishlistSchema,
  updateWishlistSchema,
} from "@validators/wishlist.validator";
import { Request, Response } from "express";

export class WishlistController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized - User ID is required" });
        return;
      }

      const validatedData = createWishlistSchema.parse(req.body);

      const wishlist = await WishlistService.create(
        Number(userId),
        validatedData
      );
      res.status(201).json(wishlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized - User ID is required" });
        return;
      }

      const wishlists = await WishlistService.getAll(Number(userId));
      res.json(wishlists);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized - User ID is required" });
        return;
      }

      const id = parseInt(req.params.id);

      const wishlist = await WishlistService.getById(Number(userId), id);
      if (!wishlist) {
        res.status(404).json({ error: "Wishlist not found" });
        return;
      }

      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized - User ID is required" });
        return;
      }

      const id = parseInt(req.params.id);
      const validatedData = updateWishlistSchema.parse(req.body);

      const wishlist = await WishlistService.update(
        Number(userId),
        id,
        validatedData
      );
      if (!wishlist) {
        res.status(404).json({ error: "Wishlist not found" });
        return;
      }

      res.json(wishlist);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized - User ID is required" });
        return;
      }

      const id = parseInt(req.params.id);

      await WishlistService.delete(Number(userId), id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
