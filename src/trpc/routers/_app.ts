import { createTRPCRouter } from "../init";
import { categoriesRouter } from "@/features/categories/server/procedures";
import { studioRouter } from "@/features/studio/server/procedures";
import { videosRouter } from "@/features/videos/server/procedures";
import { videoViewsRouter } from "@/features/video-views/procedures";
import { videoReactionsRouter } from "@/features/video-reactions/procedures";
import { subscriptionsRouter } from "@/features/subscriptions/server/procedures";
import { commentsRouter } from "@/features/comments/server/procedures";
import { commentReactionsRouter } from "@/features/comment-reactions/procedures";
import { suggestionsRouter } from "@/features/video-suggestions/server/procedures";
import { searchRouter } from "@/features/search/server/procedures";
import { playlistRouter } from "@/features/playlists/server/procedures";

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  videos: videosRouter,
  categories: categoriesRouter,
  videoViews: videoViewsRouter,
  videoReactions: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
  comments: commentsRouter,
  commentReactions: commentReactionsRouter,
  suggestions: suggestionsRouter,
  search: searchRouter,
  playlists: playlistRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
