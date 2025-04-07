import { Request, Response } from "express";
import { LibraryService } from "../services/library.service";
import {
  CreateLibraryType,
  UpdateLibraryType,
} from "../validators/library.validation";
import { logInfo, logWarn } from "../utils/logger.util";

export class LibraryController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("LibraryController.create ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }

      const data = req.body as CreateLibraryType;
      const library = await LibraryService.create(Number(userId), data);

      logInfo(
        "LibraryController.create ---- Library entry created for user ${userId} and movie ${data.movieId}"
      );
      res.status(201).json(library);
    } catch (error) {
      logWarn(
        "LibraryController.create ---- Error creating library entry: ${error}"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("LibraryController.getAll ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }

      const libraries = await LibraryService.getAll(Number(userId));

      logInfo(
        "LibraryController.getAll ---- Retrieved all library entries for user ${userId}"
      );
      res.json(libraries);
    } catch (error) {
      logWarn(
        "LibraryController.getAll ---- Error retrieving library entries: ${error}"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("LibraryController.getById ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }
      // TODO: Check if the user is the owner of the library entry
      const { id } = req.params;
      const library = await LibraryService.getById(Number(id));

      if (!library) {
        logWarn(
          "LibraryController.getById ---- Library entry not found with id ${id}"
        );
        res.status(404).json({ message: "Library entry not found" });
      }

      if (library?.userId !== userId) {
        logWarn(
          "LibraryController.getById ---- Unauthorized access to library entry ${id}"
        );
        res.status(403).json({ message: "Forbidden" });
      }

      logInfo("LibraryController.getById ---- Retrieved library entry ${id}");
      res.json(library);
    } catch (error) {
      logWarn(
        "LibraryController.getById ---- Error retrieving library entry: ${error}"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("LibraryController.update ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }
      // TODO: Check if the user is the owner of the library entry
      const { id } = req.params;
      const data = req.body as UpdateLibraryType;
      const library = await LibraryService.getById(Number(id));

      if (!library) {
        logWarn(
          "LibraryController.update ---- Library entry not found with id ${id}"
        );
        res.status(404).json({ message: "Library entry not found" });
      }

      if (library?.userId !== userId) {
        logWarn(
          "LibraryController.update ---- Unauthorized access to library entry ${id}"
        );
        res.status(403).json({ message: "Forbidden" });
      }

      const updatedLibrary = await LibraryService.update(Number(id), data);

      logInfo("LibraryController.update ---- Updated library entry ${id}");
      res.json(updatedLibrary);
    } catch (error) {
      logWarn(
        "LibraryController.update ---- Error updating library entry: ${error}"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        logWarn("LibraryController.delete ---- Unauthorized access attempt");
        res.status(401).json({ message: "Unauthorized" });
      }
      // TODO: Check if the user is the owner of the library entry
      const { id } = req.params;
      const library = await LibraryService.getById(Number(id));

      if (!library) {
        logWarn(
          "LibraryController.delete ---- Library entry not found with id ${id}"
        );
        res.status(404).json({ message: "Library entry not found" });
      }

      if (library?.userId !== userId) {
        logWarn(
          "LibraryController.delete ---- Unauthorized access to library entry ${id}"
        );
        res.status(403).json({ message: "Forbidden" });
      }

      await LibraryService.delete(Number(id));

      logInfo("LibraryController.delete ---- Deleted library entry ${id}");
      res.status(204).send();
    } catch (error) {
      logWarn(
        "LibraryController.delete ---- Error deleting library entry: ${error}"
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
