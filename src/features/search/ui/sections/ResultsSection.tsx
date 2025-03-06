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

interface ResultsSectionProps {
  query: string;
  categoryId: string | undefined;
}

export const ResultsSection = ({ query, categoryId }: ResultsSectionProps) => {
  return (
    <Suspense
      key={`${query}-${categoryId}`}
      fallback={<ResultsSectionSkeleton />}
    >
      <ErrorBoundary fallback={<p>Something went wrong...</p>}>
        <ResultsSectionSuspense query={query} categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ResultsSectionSkeleton = () => {
  return (
    <>
      <div className="md:hidden flex flex-col gap-4 gap-y-10">
        {[...Array(5)].map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
      <div className="md:flex hidden flex-col gap-4">
        {[...Array(5)].map((_, index) => (
          <VideoRowCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

const ResultsSectionSuspense = ({ query, categoryId }: ResultsSectionProps) => {
  const [results, resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {results.pages
          .flatMap((page) => page.items)
          .map((item) => (
            <VideoGridCard key={item.id} data={item} />
          ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {results.pages
          .flatMap((page) => page.items)
          .map((item) => (
            <VideoRowCard key={item.id} data={item} />
          ))}
      </div>
      <InfiniteScroll
        hasNextPage={resultQuery.hasNextPage}
        isFetchingNextPage={resultQuery.isFetchingNextPage}
        fetchNextPage={resultQuery.fetchNextPage}
      />
    </>
  );
};
