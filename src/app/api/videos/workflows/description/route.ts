import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import model from "@/lib/gemini";
import { DESCRIPTION_SYSTEM_PROMPT } from "@/constants";

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

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: DESCRIPTION_SYSTEM_PROMPT,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
    },
  });

  const generatedDescription = result.response.text();

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        description: generatedDescription || video.description || "",
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });
});
