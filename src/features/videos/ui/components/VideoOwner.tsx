import { VideoGetOneOutput } from "@/features/videos/types";
import { UserAvatar } from "@/components/UserAvatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { SubscriptionButton } from "@/features/subscriptions/ui/components/SubscriptionButton";
import { UserInfo } from "@/features/users/ui/components/UserInfo";
import { VideoReactions } from "@/features/videos/ui/components/VideoReactions";
import { VideoMenu } from "@/features/videos/ui/components/VideoMenu";
import { useSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  video: VideoGetOneOutput;
}

export const VideoOwner = ({ user, video }: VideoOwnerProps) => {
  const { userId, isLoaded } = useAuth();

  const { handleSubscribe, isPending } = useSubscriptions({
    fromVideoId: video.id,
    creatorId: user.id,
    isSubscribed: user.viewerSubscribed,
  });

  return (
    <div className="w-full flex justify-between gap-4">
      <div className="flex-1 flex gap-6 items-center">
        <Link href={`/users/${user.id}`} className="flex items-center gap-2">
          <UserAvatar size="lg" imageUrl={user.imageUrl} name={user.name} />

          <div className="flex flex-col">
            <UserInfo name={user.name} size="lg" />
            <p className="text-sm text-muted-foreground">
              {user.subscriberCount} subscribers
            </p>
          </div>
        </Link>
        {userId === user.clerkId ? (
          <Button
            asChild
            className="rounded-full w-[120px]"
            variant="secondary"
          >
            <Link href={`/studio/videos/${video.id}`}>Edit Video</Link>
          </Button>
        ) : (
          <SubscriptionButton
            onClick={handleSubscribe}
            disabled={isPending || !isLoaded}
            isSubscribed={user.viewerSubscribed}
            className="flex"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <VideoReactions
          videoId={video.id}
          likes={video.likeCount}
          dislikes={video.dislikeCount}
          viewerReaction={video.viewerReaction}
        />
        <VideoMenu videoId={video.id} variant="secondary" />
      </div>
    </div>
  );
};
