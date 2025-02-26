import { Button } from "@/components/ui/button";
import { motion, useAnimationControls } from "framer-motion";
import { thumbsUpVariants } from "@/features/videos/ui/animation-variants";
import { ThumbsDown, ThumbsUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { AuthorLikeItem } from "@/features/comments/ui/components/AuthorLikeItem";
import { CommentsGetManyOutput } from "@/features/comments/types";

interface CommentReactionsProps {
  commentId: string;
  videoId: string;
  viewerReaction: "like" | "dislike" | null;
  likes: number;
  dislikes: number;
  isAuthorLiked: boolean;
  author: CommentsGetManyOutput["author"];
}

export const CommentReactions = ({
  commentId,
  videoId,
  viewerReaction,
  likes,
  dislikes,
  isAuthorLiked,
  author,
}: CommentReactionsProps) => {
  const utils = trpc.useUtils();
  const clerk = useClerk();
  const controls = useAnimationControls();

  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      void utils.comments.getMany.invalidate({ videoId });
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });

  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      void utils.comments.getMany.invalidate({ videoId });
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });

  const handleLike = () => {
    like.mutate({ commentId });

    controls.start("animate");
  };

  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex w-full gap-2 items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="text-black rounded-full size-8"
            onClick={handleLike}
            disabled={like.isPending || dislike.isPending}
          >
            <motion.div
              variants={thumbsUpVariants}
              initial="initial"
              animate={controls}
            >
              <ThumbsUpIcon
                className={cn(
                  "size-2",
                  viewerReaction === "like" &&
                    "fill-yellow-300 stroke-yellow-400",
                )}
              />
            </motion.div>
          </Button>
          {likes > 0 && (
            <span className="text-xs text-muted-foreground">{likes}</span>
          )}
        </div>

        <div className="flex items-center">
          <Button
            variant="ghost"
            className="text-black rounded-full size-8"
            onClick={() => dislike.mutate({ commentId })}
            disabled={like.isPending || dislike.isPending}
          >
            <ThumbsDown
              className={cn(
                viewerReaction === "dislike" &&
                  "fill-yellow-300 stroke-yellow-400",
              )}
            />
          </Button>
          {dislikes > 0 && (
            <span className="text-xs text-muted-foreground">{dislikes}</span>
          )}
        </div>

        {isAuthorLiked && author && <AuthorLikeItem author={author} />}
      </div>
    </div>
  );
};
