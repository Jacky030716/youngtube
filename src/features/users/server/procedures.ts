import { z } from "zod";
import { db } from "@/db/drizzle";
import { TRPCError } from "@trpc/server";
import { subscriptions, users, videos } from "@/db/schema";
import { eq, getTableColumns, isNotNull } from "drizzle-orm";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { inArray } from "drizzle-orm/sql/expressions/conditions";

export const usersRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { clerkUserId } = ctx;

      let userId;

      if (clerkUserId) {
        const [user] = await db
          .select()
          .from(users)
          .where(inArray(users.clerkId, [clerkUserId]));

        if (user) {
          userId = user.id;
        }
      }

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : [])),
      );

      const [existingUser] = await db
        .with(viewerSubscriptions)
        .select({
          ...getTableColumns(users),
          viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
            Boolean,
          ),
          videoCount: db.$count(videos, eq(videos.userId, users.id)),
          subscriberCount: db.$count(
            subscriptions,
            eq(subscriptions.creatorId, users.id),
          ),
        })
        .from(users)
        .leftJoin(
          viewerSubscriptions,
          eq(users.id, viewerSubscriptions.creatorId),
        )
        .where(eq(users.id, input.id));

      if (!existingUser) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingUser;
    }),
});
