import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";
import { UTApi } from "uploadthing/server";
import { imageModel } from "@/lib/gemini";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId, prompt } = input;

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) {
      throw new Error("Video not found");
    }

    return existingVideo;
  });

  await context.run("generate-and-upload-thumbnail", async () => {
    try {
      const enhancePrompt = `${prompt}. Generate a 16:9 Youtube-liked thumbnail for this video`;

      const result = await imageModel.generateContent(enhancePrompt);

      if (!result.response || !result.response.candidates) {
        throw new Error("No response from Gemini");
      }

      let imageData = null;
      for (const part of result.response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }

      if (!imageData) {
        throw new Error("No valid thumbnail data found");
      }

      const buffer = Buffer.from(imageData, "base64");

      const utapi = new UTApi();

      // Delete existing thumbnail if it exists
      if (video.thumbnailKey) {
        try {
          await utapi.deleteFiles(video.thumbnailKey);
          console.log(`Deleted existing thumbnail: ${video.thumbnailKey}`);
        } catch (error) {
          console.error("Error deleting existing thumbnail:", error);
        }
      }

      const newThumbnail = await utapi.uploadFiles(
        new File([buffer], `thumbnail-${videoId}.png`),
      );

      const thumbnailUrl = newThumbnail.data?.ufsUrl;
      const thumbnailKey = newThumbnail.data?.key;

      if (!thumbnailUrl || !thumbnailKey) {
        throw new Error("Failed to upload thumbnail");
      }

      await db
        .update(videos)
        .set({
          thumbnailKey,
          thumbnailUrl,
        })
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

      return { thumbnailUrl, thumbnailKey };
    } catch (error) {
      console.error("Error in generate-and-upload-thumbnail:", error);
      throw new Error(`Thumbnail generation and upload failed`);
    }
  });
});
