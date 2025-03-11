"use client";

import { InfiniteScroll } from "@/components/InfiniteScroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/features/video-suggestions/ui/components/VideoGridCard";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/features/video-suggestions/ui/components/VideoRowCard";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface SinglePlaylistVideoSectionProps {
  playlistId: string;
}

export const SinglePlaylistVideoSection = ({
  playlistId,
}: SinglePlaylistVideoSectionProps) => {
  return (
    <Suspense fallback={<SinglePlaylistVideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Something went wrong...</p>}>
        <SinglePlaylistVideoSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const SinglePlaylistVideoSectionSkeleton = () => (
  <>
    <div className="flex flex-col gap-4 gap-y-10 md:hidden">
      {Array.from({ length: 8 }).map((_, index) => (
        <VideoGridCardSkeleton key={index} />
      ))}
    </div>
    <div className="hidden flex-col gap-4 md:flex">
      {Array.from({ length: 8 }).map((_, index) => (
        <VideoRowCardSkeleton key={index} size="compact" />
      ))}
    </div>
  </>
);

const SinglePlaylistVideoSectionSuspense = ({
  playlistId,
}: SinglePlaylistVideoSectionProps) => {
  const utils = trpc.useUtils();

  const [videos, query] =
    trpc.playlists.getPlaylistVideos.useSuspenseInfiniteQuery(
      {
        playlistId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video removed from playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideos.invalidate({ videoId: data.videoId });
      utils.playlists.getOne.invalidate({ playlistId: data.playlistId });
      utils.playlists.getPlaylistVideos.invalidate({
        playlistId: data.playlistId,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRemove = (videoId: string) => {
    removeVideo.mutate({
      playlistId,
      videoId,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard
              key={video.id}
              data={video}
              onRemove={() => handleRemove(video.id)}
            />
          ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard
              key={video.id}
              data={video}
              size="compact"
              onRemove={() => handleRemove(video.id)}
            />
          ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};
