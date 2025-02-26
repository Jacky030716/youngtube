import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const subscriptionsRouter = createTRPCRouter({
  subscribe: protectedProcedure
    .input(
      z.object({
        creatorId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { creatorId } = input;
      const { id: viewerId } = ctx.user;

      const [newSubscription] = await db
        .insert(subscriptions)
        .values({
          viewerId,
          creatorId,
        })
        .returning();

      return newSubscription;
    }),
  unsubscribe: protectedProcedure
    .input(
      z.object({
        creatorId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { creatorId } = input;
      const { id: viewerId } = ctx.user;

      const [deletedSubscription] = await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, viewerId),
            eq(subscriptions.creatorId, creatorId),
          ),
        )
        .returning();

      return deletedSubscription;
    }),
});
