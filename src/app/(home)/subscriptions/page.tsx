import { DEFAULT_LIMIT } from "@/constants";
import { SubscriptionView } from "@/features/subscriptions/ui/views/SubscriptionView";
import { HydrateClient, trpc } from "@/trpc/server";

const SubscriptionPage = async () => {
  void trpc.subscriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SubscriptionView />
    </HydrateClient>
  );
};

export default SubscriptionPage;
