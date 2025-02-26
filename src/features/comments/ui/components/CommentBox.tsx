import { UserAvatar } from "@/components/UserAvatar";
import { CommentsGetManyOutput } from "@/features/comments/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { trpc } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { CommentReactions } from "@/features/comments/ui/components/CommentReactions";

interface CommentBoxProps {
  comment: CommentsGetManyOutput["items"][number];
  author: CommentsGetManyOutput["author"];
}

export const CommentBox = ({ comment, author }: CommentBoxProps) => {
  const { userId } = useAuth();
  const utils = trpc.useUtils();

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
    <div className="w-full flex gap-2">
      <UserAvatar imageUrl={comment.user.imageUrl} name={comment.user.name} />
      <div className="flex-1 flex flex-col gap-1">
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
        <CommentReactions
          commentId={comment.id}
          videoId={comment.videoId}
          viewerReaction={comment.viewerReaction}
          likes={comment.likeCount}
          dislikes={comment.dislikeCount}
          author={author}
          isAuthorLiked={comment.isAuthorLiked}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <MessageSquareIcon className="mr-2 size-4" />
            Reply
          </DropdownMenuItem>
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
  );
};
