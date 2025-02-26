import { HydrateClient, trpc } from "@/trpc/server";
import { StudioView } from "@/features/studio/ui/views/StudioView";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

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
