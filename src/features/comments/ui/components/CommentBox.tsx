import { UserAvatar } from "@/components/UserAvatar";
import { CommentsGetManyOutput } from "@/features/comments/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { trpc } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  MessageSquareIcon,
  MoreVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { CommentReactions } from "@/features/comments/ui/components/CommentReactions";
import { CommentForm } from "@/features/comments/ui/components/CommentForm";
import { cn } from "@/lib/utils";
import { CommentReplies } from "@/features/comments/ui/components/CommentReplies";

interface CommentBoxProps {
  comment: CommentsGetManyOutput["items"][number];
  author: CommentsGetManyOutput["author"];
  variant?: "reply" | "comment";
}

export const CommentBox = ({
  comment,
  author,
  variant = "comment",
}: CommentBoxProps) => {
  const { userId } = useAuth();
  const utils = trpc.useUtils();

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const dateToNow = useMemo(() => {
    return formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
    });
  }, [comment.createdAt]);

  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      void utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
  });

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex gap-2">
        <UserAvatar imageUrl={comment.user.imageUrl} name={comment.user.name} />
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="w-full flex justify-between space-y-2">
            <div className="flex flex-col gap-1">
              <Link
                href={`/users/${comment.user.id}`}
                className="flex gap-2 items-center"
              >
                <p className="text-sm">@{comment.user.name}</p>
                <span className="text-xs text-muted-foreground hover:text-gray-700 transition-colors duration-150">
                  {dateToNow}
                </span>
              </Link>
              <p className="text-sm">{comment.value}</p>
              <div className="flex gap-2 items-center w-max">
                <CommentReactions
                  commentId={comment.id}
                  videoId={comment.videoId}
                  viewerReaction={comment.viewerReaction}
                  likes={comment.likeCount}
                  dislikes={comment.dislikeCount}
                  author={author}
                  isAuthorLiked={comment.isAuthorLiked}
                />
                {variant === "comment" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => setIsReplyOpen(true)}
                  >
                    Reply
                  </Button>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {variant === "comment" && (
                  <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                    <MessageSquareIcon className="mr-2 size-4" />
                    Reply
                  </DropdownMenuItem>
                )}
                {comment.user.clerkId === userId && (
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ commentId: comment.id })}
                  >
                    <Trash2Icon className="mr-2 size-4" />
                    Delete comment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isReplyOpen && variant === "comment" && (
            <div>
              <CommentForm
                variant="reply"
                parentId={comment.id}
                videoId={comment.videoId}
                onSuccess={() => {
                  setIsReplyOpen(false);
                  setIsRepliesOpen(true);
                }}
                onCancel={() => setIsReplyOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
      {comment.repliesCount > 0 && variant === "comment" && (
        <div className="pl-10 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit text-blue-500 text-sm font-medium hover:text-blue-600 hover:bg-blue-50"
            onClick={() => setIsRepliesOpen((prev) => !prev)}
          >
            <ChevronDown
              className={cn(
                "transition-transform ease-in-out",
                isRepliesOpen ? "transform rotate-180" : "transform rotate-0",
              )}
            />
            {comment.repliesCount} replies
          </Button>

          {isRepliesOpen && (
            <CommentReplies parentId={comment.id} videoId={comment.videoId} />
          )}
        </div>
      )}
    </div>
  );
};
