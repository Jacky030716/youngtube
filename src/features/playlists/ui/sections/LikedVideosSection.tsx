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

export const LikedVideosSection = () => {
  return (
    <Suspense fallback={<LikedVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Something went wrong...</p>}>
        <LikedVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const LikedVideosSectionSkeleton = () => (
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

const LikedVideosSectionSuspense = () => {
  const [videos, query] = trpc.playlists.getLiked.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard key={video.id} data={video} size="compact" />
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
