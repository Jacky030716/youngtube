import { createTRPCRouter } from "../init";
import { categoriesRouter } from "@/features/categories/server/procedures";
import { studioRouter } from "@/features/studio/server/procedures";
import { videosRouter } from "@/features/videos/server/procedures";

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  videos: videosRouter,
  categories: categoriesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
