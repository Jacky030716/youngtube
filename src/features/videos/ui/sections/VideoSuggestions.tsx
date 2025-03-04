"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/features/video-suggestions/ui/components/VideoRowCard";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/features/video-suggestions/ui/components/VideoGridCard";
import { InfiniteScroll } from "@/components/InfiniteScroll";

interface VideoSuggestionsProps {
  videoId: string;
  isManual?: boolean;
}

export const VideoSuggestions = ({
  videoId,
  isManual,
}: VideoSuggestionsProps) => {
  return (
    <Suspense fallback={<VideoSuggestionSkeleton />}>
      <ErrorBoundary fallback={<p>Something went wrong...</p>}>
        <VideoSuggestionsSuspense videoId={videoId} isManual={isManual} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSuggestionSkeleton = () => (
  <>
    <div className="hidden md:block space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <VideoRowCardSkeleton key={index} size="default" />
      ))}
    </div>
    <div className="block md:hidden space-y-10">
      {Array.from({ length: 5 }).map((_, index) => (
        <VideoGridCardSkeleton key={index} />
      ))}
    </div>
  </>
);

const VideoSuggestionsSuspense = ({
  videoId,
  isManual,
}: VideoSuggestionsProps) => {
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      {
        videoId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <>
      <div className="max-md:hidden space-y-3">
        {suggestions.pages
          .flatMap((page) => page.items)
          .map((item) => (
            <VideoRowCard key={item.id} data={item} size="compact" />
          ))}
      </div>

      <div className="block md:hidden space-y-10">
        {suggestions.pages
          .flatMap((page) => page.items)
          .map((item) => (
            <VideoGridCard key={item.id} data={item} />
          ))}
      </div>
      <InfiniteScroll
        isManual={isManual}
        fetchNextPage={query.fetchNextPage}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </>
  );
};
