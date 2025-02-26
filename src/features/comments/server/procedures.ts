import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { commentReactions, comments, users, videos } from "@/db/schema";
import {
  and,
  or,
  desc,
  eq,
  lt,
  getTableColumns,
  count,
  isNotNull,
} from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { inArray } from "drizzle-orm/sql/expressions/conditions";

export const commentsRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user;

      const [deletedComment] = await db
        .delete(comments)
        .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
        .returning();

      if (!deletedComment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deletedComment;
    }),
  create: protectedProcedure
    .input(z.object({ videoId: z.string().uuid(), value: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { videoId, value } = input;
      const { id: userId } = ctx.user;

      const [createdComment] = await db
        .insert(comments)
        .values({
          value,
          userId,
          videoId,
        })
        .returning();

      return createdComment;
    }),
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
    .query(async ({ input, ctx }) => {
      const { videoId, cursor, limit } = input;
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

      // Count total comments
      const [totalComments] = await db
        .select({
          count: count(comments.id),
        })
        .from(comments)
        .where(eq(comments.videoId, videoId));

      // First, get the video author's ID
      const [videoWithAuthor] = await db
        .select({
          userId: videos.userId,
          author: users,
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(eq(videos.id, videoId));

      const videoAuthorId = videoWithAuthor?.userId;
      const videoAuthor = videoWithAuthor?.author;

      const viewerReaction = db.$with("viewer_reaction").as(
        db
          .select({
            userId: commentReactions.userId,
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : [])),
      );

      const authorLiked = db.$with("author_liked").as(
        db
          .select({
            commentId: commentReactions.commentId,
            hasLiked: commentReactions.type,
          })
          .from(commentReactions)
          .where(
            and(
              videoAuthorId
                ? eq(commentReactions.userId, videoAuthorId)
                : undefined,
              eq(commentReactions.type, "like"),
            ),
          ),
      );

      const data = await db
        .with(viewerReaction, authorLiked)
        .select({
          ...getTableColumns(comments),
          user: users,
          likeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.commentId, comments.id),
              eq(commentReactions.type, "like"),
            ),
          ),
          dislikeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.commentId, comments.id),
              eq(commentReactions.type, "dislike"),
            ),
          ),
          viewerReaction: viewerReaction.type,
          isAuthorLiked: isNotNull(authorLiked.hasLiked).mapWith(Boolean),
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(viewerReaction, eq(comments.id, viewerReaction.commentId))
        .leftJoin(authorLiked, eq(authorLiked.commentId, comments.id))
        .where(
          and(
            eq(comments.videoId, videoId),
            cursor
              ? or(
                  lt(comments.updatedAt, cursor.updatedAt),
                  and(
                    eq(comments.updatedAt, cursor.updatedAt),
                    lt(comments.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        .limit(limit + 1); // fetch one more to see if there are more pages

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = lastItem
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
        commentsCount: totalComments.count,
        author: videoAuthor,
      };
    }),
});
