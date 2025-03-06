import { DEFAULT_LIMIT } from "@/constants";
import { SubscriptionView } from "@/features/home/ui/views/SubscriptionView";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const TredingPage = async () => {
  void trpc.videos.getManySubscribed.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SubscriptionView />
    </HydrateClient>
  );
};

export default TredingPage;
