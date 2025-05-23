import { getS3Url, upload, uploadToS3 } from "@/utils/services/s3-upload.util";
import prisma from "@core/prisma";
import { UserService } from "@services/user.service";
import { logInfo, logWarn } from "@utils/logging/logger.util";
import {
  createUserSchema,
  updateUserSchema,
} from "@validators/user.validation";
import { Request, Response } from "express";
import { CreateUserProps, UpdateUserProps } from "src/types/types";
import { z } from "zod";

export class UserController {
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.index();

      logInfo(`List Users --- Request Received`);

      if (users.length > 0) {
        res.status(200).json({
          results: users,
        });
      } else {
        res.status(200).json({
          results: [],
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the user.",
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      upload.single("profileImage")(req, res, async (err: any) => {
        if (err) {
          return res.status(500).json({
            message: "File upload error",
            error: err.message,
          });
        }

        const user = createUserSchema.parse(req.body as CreateUserProps);
        const { file } = req;

        if (file) {
          try {
            const s3Key = await uploadToS3(file, "profiles");
            const imageUrl = getS3Url(s3Key);
            if (imageUrl) {
              user.profileImage = imageUrl;
            }
          } catch (error) {
            return res.status(500).json({
              message: "S3 upload error",
              error: (error as Error).message,
            });
          }
        }

        const createdUser = await UserService.create(user);
        logInfo(`Create User --- Created User ${createdUser}`);

        res.status(201).json({
          status: "User Created Successfully",
          data: createdUser,
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

  static async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        logWarn(`Get User --- Id Parameter is required`);
        res.status(404).json({
          message: "Id Parameter is required",
        });
      }

      const user = await UserService.get(Number(id));
      if (!user) {
        logWarn(`Get User --- User not found`);
        res.status(404).json({
          error: "User not found",
          message: "No user found with the provided identifier.",
        });
      }
      logInfo(`Get User --- Request Received`);
      res.status(200).json({ data: user });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the user.",
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      upload.single("profileImage")(req, res, async (err: any) => {
        if (err) {
          console.error("Dosya yükleme hatası:", err);
          return res.status(500).json({
            message: "File upload error",
            error: err.message,
          });
        }

        const { id } = req.params;
        const { file } = req;

        console.log("Update isteği alındı - User ID:", id);
        console.log("Form verileri:", req.body);
        console.log("Yüklenen dosya:", file);

        try {
          const user = updateUserSchema.parse(req.body as UpdateUserProps);
          console.log("Doğrulanmış kullanıcı verisi:", user);

          if (!id) {
            logWarn(`Get User --- Id Parameter is required`);
            res.status(404).json({
              message: "Id parameter is required",
            });
            return;
          }

          if (file) {
            try {
              console.log("Dosya yükleniyor...");
              const s3Key = await uploadToS3(file, "profiles");
              const imageUrl = getS3Url(s3Key);
              if (imageUrl) {
                user.profileImage = imageUrl;
              }
              console.log("Profil resmi güncellendi:", user.profileImage);
            } catch (error) {
              return res.status(500).json({
                message: "S3 upload error",
                error: (error as Error).message,
              });
            }
          } else if (user.profileImage === null) {
            console.log("Profil resmi siliniyor - null değeri alındı");
          }

          const updatedUser = await UserService.update(Number(id), user);
          logInfo(`Update User - Updated User ${JSON.stringify(updatedUser)}`);

          res.status(200).json({
            status: "SUCCESS",
            data: updatedUser,
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error("Zod validation error:", error.errors);
            return res.status(400).json({
              error: "Validation Error",
              issues: error.errors,
            });
          }

          if (error instanceof Error && error.message === "User not found") {
            res.status(404).json({
              error: "User not found",
              message: "No user found with the provided ID.",
            });
          } else {
            console.error("User update error:", error);
            throw error;
          }
        }
      });
    } catch (error) {
      console.error("General error in update function:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation Error",
          message: error.errors[0].message,
        });
      } else {
        res.status(500).json({
          error: "Internal Server Error",
          message: "An unexpected error occurred while updating the user.",
        });
      }
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        logWarn(`Get User --- Id Parameter is required`);

        res.status(404).json({
          message: "Id Parameter is required",
        });
      }

      const deletedUser = await UserService.delete(Number(id));

      logInfo(`Delete User - Deleted User ${deletedUser}`);

      res.status(200).json({
        message: "User Deleted Successfully",
        data: deletedUser,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred while deleting the user.",
      });
    }
  }

  static async upload(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    upload.single("profileImage")(req, res, async (err: any) => {
      if (err) {
        return res.status(500).json({
          message: "File upload error",
          error: err.message,
        });
      }

      const { file } = req;

      if (!file) {
        logWarn(`User Upload Image --- No file uploaded`);
        res.status(400).send("No file uploaded");
        return;
      }

      try {
        const s3Key = await uploadToS3(file, "profiles");
        const imageUrl = getS3Url(s3Key);

        if (!imageUrl) {
          return res.status(500).json({
            message: "S3 URL generation failed",
          });
        }

        const updatedUser = await prisma.user.update({
          where: { id: parseInt(id) },
          data: {
            profileImage: imageUrl,
          },
        });

        logInfo(`User Upload Image - Request Received`);

        res.status(200).json({
          message: `Profile image updated for user ${updatedUser.username}`,
          data: updatedUser,
        });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send(
            `Error updating user profile image: ${(error as Error).message}`
          );
      }
    });
  }
}
