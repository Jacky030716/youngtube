import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { model } from "@/lib/gemini";
import { TITLE_SYSTEM_PROMPT } from "@/constants";

interface InputType {
  userId: string;
  videoId: string;
}

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId } = input;

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

  const transcript = await context.run("get-transcript", async () => {
    if (video.muxTrackStatus === "ready") {
      const transcriptUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;

      const response = await fetch(transcriptUrl);
      if (response.ok) {
        const transcriptText = await response.text();
        return transcriptText;
      } else {
        return "";
      }
    } else {
      return "";
    }
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: TITLE_SYSTEM_PROMPT + transcript,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
    },
  });

  const generatedTitle = result.response.text();

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        title: generatedTitle || video.title,
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
