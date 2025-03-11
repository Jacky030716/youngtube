import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistView } from "@/features/playlists/ui/views/PlaylistView";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

const PlaylistPage = () => {
  void trpc.playlists.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <PlaylistView />
    </HydrateClient>
  );
};

export default PlaylistPage;
