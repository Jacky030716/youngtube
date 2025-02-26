import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { videoViews } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const videoViewsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user;

      const [existingVideoViews] = await db
        .select()
        .from(videoViews)
        .where(
          and(eq(videoViews.videoId, videoId), eq(videoViews.userId, userId)),
        );

      if (existingVideoViews) {
        return existingVideoViews;
      }

      const [createdVideoViews] = await db
        .insert(videoViews)
        .values({
          userId,
          videoId,
        })
        .returning();

      return createdVideoViews;
    }),
});
