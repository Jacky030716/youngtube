import { DEFAULT_LIMIT } from "@/constants";
import { TrendingView } from "@/features/home/ui/views/TrendingView";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const TredingPage = async () => {
  void trpc.videos.getManyTrending.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <TrendingView />
    </HydrateClient>
  );
};

export default TredingPage;
