import { FriendshipStatus } from "@prisma/client";
import { BaseSchema } from "@validators/base.schema";
import { z } from "zod";

export const createFriendshipSchema = BaseSchema.extend({
  friendId: z.number().int().positive(),
});

export const updateFriendshipSchema = BaseSchema.extend({
  status: z.enum([
    FriendshipStatus.PENDING,
    FriendshipStatus.ACCEPTED,
    FriendshipStatus.FOLLOWING,
    FriendshipStatus.BLOCKED,
  ]),
});

export type CreateFriendshipType = z.infer<typeof createFriendshipSchema>;
export type UpdateFriendshipType = z.infer<typeof updateFriendshipSchema>;
