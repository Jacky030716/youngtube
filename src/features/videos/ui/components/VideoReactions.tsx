import { cn } from "@/lib/utils";
import { motion, useAnimationControls } from "framer-motion";
import { trpc } from "@/trpc/client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThumbsDown, ThumbsUpIcon } from "lucide-react";
import { VideoGetOneOutput } from "@/features/videos/types";
import { thumbsUpVariants } from "@/features/videos/ui/animation-variants";
import { useClerk } from "@clerk/nextjs";

interface VideoReactionsProps {
  videoId: string;
  likes: number;
  dislikes: number;
  viewerReaction: VideoGetOneOutput["viewerReaction"];
}

export const VideoReactions = ({
  videoId,
  likes,
  dislikes,
  viewerReaction,
}: VideoReactionsProps) => {
  const utils = trpc.useUtils();
  const clerk = useClerk();
  const controls = useAnimationControls();

  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      void utils.videos.getOne.invalidate({ id: videoId });
      void utils.playlists.getLiked.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const dislike = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      void utils.videos.getOne.invalidate({ id: videoId });
      void utils.playlists.getLiked.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const handleLike = () => {
    like.mutate({ videoId });

    if (viewerReaction !== "like") {
      void controls.start("animate");
    }
  };

  return (
    <div className="flex items-center flex-none">
      <Button
        variant="secondary"
        className="rounded-none text-black pl-3 rounded-l-full rounded-r-none"
        onClick={handleLike}
        disabled={like.isPending || dislike.isPending}
      >
        <motion.div
          variants={thumbsUpVariants}
          initial="initial"
          animate={controls}
        >
          <ThumbsUpIcon
            className={cn("size-5", viewerReaction === "like" && "fill-black")}
          />
        </motion.div>
        <span>{likes}</span>
      </Button>
      <Separator orientation="vertical" className="h-7" />

      <Button
        variant="secondary"
        className="text-black pl-3 rounded-r-full rounded-l-none"
        onClick={() => dislike.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
      >
        <ThumbsDown
          className={cn(viewerReaction === "dislike" && "fill-black")}
        />
        <span>{dislikes}</span>
      </Button>
    </div>
  );
};
