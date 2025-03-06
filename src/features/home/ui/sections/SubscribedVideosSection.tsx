"use client";

import { InfiniteScroll } from "@/components/InfiniteScroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/features/video-suggestions/ui/components/VideoGridCard";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const SubscribedVideosSection = () => {
  return (
    <Suspense fallback={<SubscribedVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Something went wrong...</p>}>
        <SubscribedVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const SubscribedVideosSectionSkeleton = () => (
  <div className="w-full grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 gap-y-10">
    {Array.from({ length: 8 }).map((_, index) => (
      <VideoGridCardSkeleton key={index} />
    ))}
  </div>
);

const SubscribedVideosSectionSuspense = () => {
  const [videos, query] =
    trpc.videos.getManySubscribed.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <>
      <div className="w-full grid 2xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 gap-y-10">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
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
