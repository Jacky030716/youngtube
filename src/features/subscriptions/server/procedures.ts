import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { subscriptions, users } from "@/db/schema";
import { and, desc, eq, getTableColumns, inArray, lt, or } from "drizzle-orm";

export const subscriptionsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            creatorId: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const data = await db
        .select({
          ...getTableColumns(subscriptions),
          user: {
            ...getTableColumns(users),
            subscriberCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id),
            ),
          },
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.creatorId, users.id))
        .where(
          and(
            eq(subscriptions.viewerId, userId),
            cursor
              ? or(
                  lt(subscriptions.updatedAt, cursor.updatedAt),
                  and(
                    eq(subscriptions.updatedAt, cursor.updatedAt),
                    lt(subscriptions.creatorId, cursor.creatorId),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(subscriptions.updatedAt), desc(subscriptions.creatorId))
        .limit(limit + 1);

      const hasMore = data.length > limit;

      // Remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];

      const nextCursor = hasMore
        ? {
            creatorId: lastItem.creatorId,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
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
