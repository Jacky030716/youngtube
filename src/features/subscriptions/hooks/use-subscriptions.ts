import { useClerk } from "@clerk/nextjs";

import { trpc } from "@/trpc/client";

interface UseSubscriptionsProps {
  creatorId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

export const useSubscriptions = ({
  creatorId,
  fromVideoId,
  isSubscribed,
}: UseSubscriptionsProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const subscribe = trpc.subscriptions.subscribe.useMutation({
    onSuccess: () => {
      if (fromVideoId) {
        void utils.videos.getOne.invalidate({ id: fromVideoId });
        void utils.videos.getManySubscribed.invalidate();
      }
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const unsubscribe = trpc.subscriptions.unsubscribe.useMutation({
    onSuccess: () => {
      if (fromVideoId) {
        void utils.videos.getOne.invalidate({ id: fromVideoId });
        void utils.videos.getManySubscribed.invalidate();
      }
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const isPending = subscribe.isPending || unsubscribe.isPending;

  const handleSubscribe = () => {
    if (isSubscribed) {
      unsubscribe.mutate({ creatorId });
    } else {
      subscribe.mutate({ creatorId });
    }
  };

  return {
    handleSubscribe,
    isPending,
  };
};
