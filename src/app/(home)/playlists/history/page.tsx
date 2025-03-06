import { DEFAULT_LIMIT } from "@/constants";
import { HistoriesView } from "@/features/playlists/ui/views/HistoriesView";
import { HydrateClient, trpc } from "@/trpc/server";

const HistoriesPage = () => {
  void trpc.playlists.getHistories.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <HistoriesView />
    </HydrateClient>
  );
};

export default HistoriesPage;
