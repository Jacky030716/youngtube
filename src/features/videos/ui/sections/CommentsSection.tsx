"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CommentForm } from "@/features/comments/ui/components/CommentForm";
import { CommentBox } from "@/features/comments/ui/components/CommentBox";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { Loader2Icon } from "lucide-react";

interface CommentsSectionProps {
  videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
  return (
    <Suspense fallback={<CommentSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Failed to load comments</p>}>
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CommentSectionSkeleton = () => (
  <div className="mt-6 w-full flex items-center justify-center">
    <Loader2Icon className="animate-spin" />
  </div>
);

const CommentsSectionSuspense = ({ videoId }: CommentsSectionProps) => {
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    {
      videoId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <div className="w-full mt-6 flex flex-col gap-2">
      <h2 className="text-xl font-medium">
        {comments.pages[0].commentsCount} comments
      </h2>
      <CommentForm videoId={videoId} />

      <div className="flex flex-col gap-8 mt-6">
        {comments.pages
          .flatMap((page) => page.items)
          .map((comment) => (
            <CommentBox
              key={comment.id}
              comment={comment}
              author={comments.pages[0].author}
            />
          ))}
        <InfiniteScroll
          isManual
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
        />
      </div>
    </div>
  );
};
