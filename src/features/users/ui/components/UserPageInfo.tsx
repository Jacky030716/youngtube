import { UserAvatar } from "@/components/UserAvatar";
import { UserGetOneOutput } from "../../types";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubscriptionButton } from "@/features/subscriptions/ui/components/SubscriptionButton";
import { useSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface UserPageInfoProps {
  user: UserGetOneOutput;
}

export const UserPageInfoSkeleton = () => (
  <div className="py-6">
    <div className="flex flex-col md:hidden">
      <div className="flex items-center gap-3">
        <Skeleton className="h-[60px] w-[60px] rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
      </div>
      <Skeleton className="w-full mt-3 rounded-full h-10" />
    </div>

    <div className="md:flex gap-4 hidden">
      <Skeleton className="h-[200px] w-[200px] rounded-full" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-8 w-48 mt-3" />
        <Skeleton className="h-6 w-64 mt-1" />
        <Skeleton className="mt-3 h-10 w-full rounded-full" />
      </div>
    </div>
  </div>
);

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();

  const { handleSubscribe, isPending } = useSubscriptions({
    creatorId: user.id,
    isSubscribed: user.viewerSubscribed,
  });

  return (
    <div className="py-6">
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <UserAvatar
            size="lg"
            imageUrl={user.imageUrl}
            name={user.name}
            className="h-[60px] w-[60px]"
            onClick={() => {
              if (user.clerkId === userId) {
                clerk.openUserProfile();
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{user.subscriberCount} subscribers</span>
              <span>&bull;</span>
              <span>{user.videoCount} videos</span>
            </div>
          </div>
        </div>
        {userId === user.clerkId ? (
          <Button
            className="w-full mt-3 rounded-full"
            variant="secondary"
            asChild
          >
            <Link prefetch href="/studio">
              Go to studio
            </Link>
          </Button>
        ) : (
          <SubscriptionButton
            disabled={isPending || !isLoaded}
            isSubscribed={user.viewerSubscribed}
            onClick={handleSubscribe}
            className="w-full mt-3"
          />
        )}
      </div>

      {/* Desktop layout */}
      <div className="md:flex gap-4 hidden">
        <UserAvatar
          size="xl"
          imageUrl={user.imageUrl}
          name={user.name}
          className={cn(
            userId === user.clerkId &&
              "cursor-pointer hover:opacity-80 transition-opacity duration-300",
          )}
          onClick={() => {
            if (user.clerkId === userId) {
              clerk.openUserProfile();
            }
          }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
            <span>{user.subscriberCount} subscribers</span>
            <span>&bull;</span>
            <span>{user.videoCount} videos</span>
          </div>
          {userId === user.clerkId ? (
            <Button className="mt-3 rounded-full" variant="secondary" asChild>
              <Link prefetch href="/studio">
                Go to studio
              </Link>
            </Button>
          ) : (
            <SubscriptionButton
              disabled={isPending || !isLoaded}
              isSubscribed={user.viewerSubscribed}
              onClick={handleSubscribe}
              className="mt-3"
            />
          )}
        </div>
      </div>
    </div>
  );
};
