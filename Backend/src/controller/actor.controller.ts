import { getS3Url, upload, uploadToS3 } from "@/utils/services/s3-upload.util";
import { ActorService } from "@services/actor.service";
import { logInfo, logWarn } from "@utils/logging/logger.util";
import { createActorSchema } from "@validators/actor.validation";
import { Request, Response } from "express";
import { CreateActorProps } from "src/types/types";
import { z } from "zod";

export class ActorController {
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const actors = await ActorService.index();
      logInfo(`List Actors --- Request Received`);

      if (actors.length > 0) {
        res.status(200).json({
          results: actors,
        });
      } else {
        res.status(200).json({
          results: [],
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  static async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        logWarn(`Get Actor --- Id Parameter is required`);
        res.status(404).json({
          message: "Id Parameter is required",
        });
        return;
      }

      const actor = await ActorService.get(Number(id));
      if (!actor) {
        logWarn(`Get Actor --- Actor not found`);
        res.status(404).json({
          error: "Actor not found",
          message: "No actor found with the provided identifier.",
        });
        return;
      }

      logInfo(`Get Actor --- Request Received`);
      res.status(200).json({ data: actor });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the actor.",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      upload.single("actorImage")(req, res, async (err: any) => {
        if (err) {
          return res.status(500).json({
            message: "File upload error",
            error: err.message,
          });
        }

        const actor = createActorSchema.parse(req.body as CreateActorProps);
        const { file } = req;

        if (file) {
          try {
            const s3Key = await uploadToS3(file, "actors");
            const imageUrl = getS3Url(s3Key);
            if (imageUrl) {
              actor.photo = imageUrl;
            }
          } catch (error) {
            return res.status(500).json({
              message: "S3 upload error",
              error: (error as Error).message,
            });
          }
        }

        const createdActor = await ActorService.create(actor);
        logInfo(`Create Actor --- Created Actor ${createdActor}`);

        res.status(201).json({
          status: "Actor Created Successfully",
          data: createdActor,
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => {
          return {
            field: err.path.join("."),
            errors: err.message,
          };
        });

        res.status(400).json({
          message: "Validation Failed",
          errors: formattedErrors,
        });
      }
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      upload.single("actorImage")(req, res, async (err: any) => {
        if (err) {
          return res.status(500).json({
            message: "File upload error",
            error: err.message,
          });
        }

        const { id } = req.params;
        const { file } = req;
        const actor = createActorSchema.parse(req.body as CreateActorProps);

        if (!id) {
          logWarn(`Update Actor --- Id Parameter is required`);
          res.status(404).json({
            message: "Id parameter is required",
          });
          return;
        }

        if (file) {
          try {
            const s3Key = await uploadToS3(file, "actors");
            const imageUrl = getS3Url(s3Key);
            if (imageUrl) {
              actor.photo = imageUrl;
            }
          } catch (error) {
            return res.status(500).json({
              message: "S3 upload error",
              error: (error as Error).message,
            });
          }
        }

        const updatedActor = await ActorService.update(Number(id), actor);
        logInfo(`Update Actor - Updated Actor ${updatedActor}`);

        res.status(200).json({
          status: "SUCCESS",
          data: updatedActor,
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => {
          return {
            field: err.path.join("."),
            errors: err.message,
          };
        });

        res.status(400).json({
          message: "Validation Failed",
          errors: formattedErrors,
        });
      }
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        logWarn(`Delete Actor --- Id Parameter is required`);
        res.status(404).json({
          message: "Id Parameter is required",
        });
        return;
      }

      const deletedActor = await ActorService.delete(Number(id));
      logInfo(`Delete Actor - Deleted Actor ${deletedActor}`);

      res.status(200).json({
        message: "Actor Deleted Successfully",
        data: deletedActor,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the actor.",
      });
    }
  }
}
