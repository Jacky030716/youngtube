"use client";

import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";

import {
  VideoPlayer,
  VideoPlayerSkeleton,
} from "@/features/videos/ui/components/VideoPlayer";
import { VideoBanner } from "@/features/videos/ui/components/VideoBanner";
import {
  VideoTopRow,
  VideoTopRowSkeleton,
} from "@/features/videos/ui/components/VideoTopRow";
import { useAuth } from "@clerk/nextjs";

interface SingleVideoSectionProps {
  videoId: string;
}

export const SingleVideoSection = ({ videoId }: SingleVideoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSectionSkeleton = () => (
  <>
    <VideoPlayerSkeleton />
    <VideoTopRowSkeleton />
  </>
);

const VideoSectionSuspense = ({ videoId }: SingleVideoSectionProps) => {
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      void utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  const handlePlay = () => {
    if (!isSignedIn) return;

    createView.mutate({ videoId });
  };

  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxTrackStatus !== "ready" && "rounded-b-none",
        )}
      >
        <VideoPlayer
          autoPLay={false}
          onPlay={handlePlay}
          playbackId={video.muxPlaybackId}
          thumbnail={video.thumbnailUrl}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};
