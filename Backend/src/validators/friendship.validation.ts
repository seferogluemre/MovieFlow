import { BaseSchema } from "src/schemas/base.schema";
import { z } from "zod";
import { FriendshipStatus } from "@prisma/client";

export const createFriendshipSchema = BaseSchema.extend({
  friendId: z.number().int().positive(),
});

export const updateFriendshipSchema = BaseSchema.extend({
  status: z.enum([
    FriendshipStatus.PENDING,
    FriendshipStatus.ACCEPTED,
    FriendshipStatus.BLOCKED,
  ]),
});

export type CreateFriendshipType = z.infer<typeof createFriendshipSchema>;
export type UpdateFriendshipType = z.infer<typeof updateFriendshipSchema>;
