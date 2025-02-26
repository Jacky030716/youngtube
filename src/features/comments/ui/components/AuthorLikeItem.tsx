import { UserAvatar } from "@/components/UserAvatar";
import { CommentsGetManyOutput } from "@/features/comments/types";
import { HeartIcon } from "lucide-react";

interface AuthorLikeItemProps {
  author: CommentsGetManyOutput["author"];
}

export const AuthorLikeItem = ({ author }: AuthorLikeItemProps) => {
  return (
    <div className="w-max relative">
      <UserAvatar size="sm" imageUrl={author.imageUrl} name={author.name} />
      <div className="absolute -bottom-1 -right-1">
        <HeartIcon className="size-3.5 fill-red-400 stroke-red-400" />
      </div>
    </div>
  );
};
