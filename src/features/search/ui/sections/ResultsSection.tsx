"use client";

import { InfiniteScroll } from "@/components/InfiniteScroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard } from "@/features/video-suggestions/ui/components/VideoGridCard";
import { VideoRowCard } from "@/features/video-suggestions/ui/components/VideoRowCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ResultsSectionProps {
  query: string;
  categoryId: string | undefined;
}

export const ResultsSection = ({ query, categoryId }: ResultsSectionProps) => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Something went wrong...</p>}>
        <ResultsSectionSuspense query={query} categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ResultsSectionSuspense = ({ query, categoryId }: ResultsSectionProps) => {
  const isMobile = useIsMobile();

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
      {isMobile ? (
        <div className="flex flex-col gap-4 gap-y-10">
          {results.pages
            .flatMap((page) => page.items)
            .map((item) => (
              <VideoGridCard key={item.id} data={item} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {results.pages
            .flatMap((page) => page.items)
            .map((item) => (
              <VideoRowCard key={item.id} data={item} />
            ))}
        </div>
      )}
      <InfiniteScroll
        hasNextPage={resultQuery.hasNextPage}
        isFetchingNextPage={resultQuery.isFetchingNextPage}
        fetchNextPage={resultQuery.fetchNextPage}
      />
    </>
  );
};
