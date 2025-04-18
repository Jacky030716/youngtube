import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { users, videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const f = createUploadthing();

export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  bannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

      if (!existingUser) throw new UploadThingError("User not found");

      if (existingUser.bannerKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingUser.bannerKey);

        console.log(`Deleted thumbnail ${existingUser.bannerKey}`);

        await db
          .update(users)
          .set({
            bannerKey: null,
            bannerUrl: null,
          })
          .where(eq(users.id, existingUser.id));
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: existingUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(users)
        .set({
          bannerUrl: file.ufsUrl,
          bannerKey: file.key,
        })
        .where(eq(users.id, metadata.userId));

      return { uploadedBy: metadata.userId };
    }),
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        videoId: z.string().uuid(),
      }),
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

      if (!user) throw new UploadThingError("User not found");

      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
        })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));

      if (!existingVideo) throw new UploadThingError("Video not found");

      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingVideo.thumbnailKey);

        console.log(`Deleted thumbnail ${existingVideo.thumbnailKey}`);

        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null,
          })
          .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { user, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.ufsUrl,
          thumbnailKey: file.key,
        })
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.user.id),
          ),
        );

      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
