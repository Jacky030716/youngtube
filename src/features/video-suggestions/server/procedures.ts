import { z } from "zod";
import { db } from "@/db/drizzle";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, or, eq, lt, desc, getTableColumns, not } from "drizzle-orm";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";

export const suggestionsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input }) => {
      const { cursor, limit, videoId } = input;

      // May use algoria to recommend videos

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like"),
            ),
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            not(eq(videos.id, videoId)),
            eq(videos.videoVisibility, "public"),
            existingVideo.categoryId
              ? eq(videos.categoryId, existingVideo.categoryId)
              : cursor
                ? or(
                    lt(videos.updatedAt, cursor.updatedAt),
                    and(
                      eq(videos.updatedAt, cursor.updatedAt),
                      lt(videos.id, cursor.id),
                    ),
                  )
                : undefined,
          ),
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;

      // Remove last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];

      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
});
