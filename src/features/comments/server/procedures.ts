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
  isNull,
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
    .input(
      z.object({
        parentId: z.string().uuid().nullable().optional().default(null),
        videoId: z.string().uuid(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { parentId, videoId, value } = input;
      const { id: userId } = ctx.user;

      console.log("parentid", parentId);

      const existingComment = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []));

      if (!existingComment && parentId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (
        existingComment.length > 0 &&
        existingComment[0].parentId &&
        parentId
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [createdComment] = await db
        .insert(comments)
        .values({
          value,
          userId,
          videoId,
          parentId: parentId ?? null,
        })
        .returning();

      return createdComment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        parentId: z.string().uuid().nullish(),
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
      const { videoId, cursor, limit, parentId } = input;
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

      const replies = db.$with("replies").as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId),
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
        .with(viewerReaction, authorLiked, replies)
        .select({
          ...getTableColumns(comments),
          user: users,
          repliesCount: replies.count,
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
        .leftJoin(replies, eq(replies.parentId, comments.id))
        .leftJoin(authorLiked, eq(authorLiked.commentId, comments.id))
        .where(
          and(
            eq(comments.videoId, videoId),
            parentId
              ? eq(comments.parentId, parentId)
              : isNull(comments.parentId),
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
