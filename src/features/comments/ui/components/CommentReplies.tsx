import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { Loader2Icon } from "lucide-react";
import { CommentBox } from "@/features/comments/ui/components/CommentBox";

interface CommentRepliesProps {
  parentId: string;
  videoId: string;
}

export const CommentReplies = ({ parentId, videoId }: CommentRepliesProps) => {
  const { data, isLoading } = trpc.comments.getMany.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
      videoId,
      parentId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <div className="flex flex-col mt-4 gap-4">
      {isLoading && (
        <div className="flex justify-center items-center">
          <Loader2Icon className="animate-spin" />
        </div>
      )}
      {!isLoading &&
        data?.pages
          .flatMap((page) => page.items)
          .map((comment) => (
            <CommentBox
              key={comment.id}
              comment={comment}
              author={data.pages[0].author}
            />
          ))}
    </div>
  );
};
