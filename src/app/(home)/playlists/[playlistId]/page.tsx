import React from "react";
import { HydrateClient, trpc } from "@/trpc/server";
import { SinglePlaylistView } from "@/features/playlists/ui/views/SinglePlaylistView";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface SinglePlaylistPageProps {
  params: Promise<{
    playlistId: string;
  }>;
}

const SinglePlaylistPage = async ({ params }: SinglePlaylistPageProps) => {
  const { playlistId } = await params;

  void trpc.playlists.getPlaylistVideos.prefetchInfinite({
    playlistId,
    limit: DEFAULT_LIMIT,
  });

  void trpc.playlists.getOne.prefetch({ playlistId });

  return (
    <HydrateClient>
      <SinglePlaylistView playlistId={playlistId} />
    </HydrateClient>
  );
};

export default SinglePlaylistPage;
