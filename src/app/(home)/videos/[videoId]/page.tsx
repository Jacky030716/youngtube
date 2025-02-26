import React from "react";
import { HydrateClient, trpc } from "@/trpc/server";
import { SingleVideoView } from "@/features/videos/ui/views/SingleVideoView";
import { DEFAULT_LIMIT } from "@/constants";

interface VideoPageProps {
  params: Promise<{
    videoId: string;
  }>;
}

const VideoPage = async ({ params }: VideoPageProps) => {
  const { videoId } = await params;
  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.comments.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SingleVideoView videoId={videoId} />
    </HydrateClient>
  );
};
export default VideoPage;
