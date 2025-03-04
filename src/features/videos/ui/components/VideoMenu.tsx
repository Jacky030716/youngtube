import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { APP_URL } from "@/constants";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

export const VideoMenu = ({
  variant = "ghost",
  videoId,
  onRemove,
}: VideoMenuProps) => {
  const onShare = () => {
    const fullUrl = `${APP_URL || "http://localhost:3000"}/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl);

    toast.success("Link copied to clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className="rounded-full" size="icon">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem className="flex gap-2 items-center" onClick={onShare}>
          <ShareIcon className="size-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem className="flex gap-2 items-center">
          <ListPlusIcon className="size-4" />
          Save
        </DropdownMenuItem>
        {onRemove && (
          <DropdownMenuItem className="flex gap-2 items-center">
            <Trash2Icon className="size-4" />
            Remove
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
