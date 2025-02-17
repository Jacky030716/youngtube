import { HydrateClient, trpc } from "@/trpc/server";
import { StudioView } from "@/features/studio/ui/view/StudioView";
import { DEFAULT_LIMIT } from "@/constants";

const StudioPage = async () => {
  void trpc.studio.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};

export default StudioPage;
