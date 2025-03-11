import React from "react";
import { HydrateClient, trpc } from "@/trpc/server";
import { SingleVideoView } from "@/features/videos/ui/views/SingleVideoView";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface VideoPageProps {
  params: Promise<{
    videoId: string;
  }>;
}

export const generateMetadata = async ({ params }: VideoPageProps) => {
  const { videoId } = await params;
  const video = await trpc.videos.getOne({ id: videoId });

  return {
    title: `${video.title} | Watch Now - YoungTube`,
    description: `Watch now on YoungTube. ${video.description ?? ""}. Subscribe for more videos like this!`,
    openGraph: {
      title: `${video.title} | Watch Now - YoungTube`,
      description: `Watch now on YoungTube. ${video.description ?? ""} Subscribe for more videos like this!`,
      images: [
        {
          url: video.thumbnailUrl,
          width: 1280,
          height: 720,
          alt: video.title,
        },
      ],
    },
  };
};

const VideoPage = async ({ params }: VideoPageProps) => {
  const { videoId } = await params;

  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.comments.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });
  void trpc.suggestions.getMany.prefetchInfinite({
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
