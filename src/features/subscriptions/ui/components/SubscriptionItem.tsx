import { UserAvatar } from "@/components/UserAvatar";
import { SubscriptionButton } from "./SubscriptionButton";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionItemProps {
  name: string;
  imageUrl: string;
  subscriberCount: number;
  onUnsubscribe: () => void;
  disabled: boolean;
}

export const SubscriptionItemSkeleton = () => (
  <div className="flex gap-4">
    <Skeleton className="size-10 rounded-full" />

    <div className="flex-1">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="w-20 h-4 rounded-md" />
          <Skeleton className="w-10 h-3 mt-1 rounded-md" />
        </div>

        <Skeleton className="w-20 h-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const SubscriptionItem = ({
  name,
  imageUrl,
  subscriberCount,
  onUnsubscribe,
  disabled,
}: SubscriptionItemProps) => {
  return (
    <div className="flex items-start gap-4">
      <UserAvatar imageUrl={imageUrl} size="lg" name={name} />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {subscriberCount.toLocaleString()} subscriber
              {subscriberCount !== 1 && "s"}
            </p>
          </div>

          <SubscriptionButton
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onUnsubscribe();
            }}
            disabled={disabled}
            isSubscribed
          />
        </div>
      </div>
    </div>
  );
};
