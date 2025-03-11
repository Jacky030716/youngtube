"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { CreatePlaylistModal } from "../components/CreatePlaylistModal";
import { useState } from "react";
import { PlaylistsSection } from "../sections/PlaylistsSection";

export const PlaylistView = () => {
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);

  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <CreatePlaylistModal
        open={playlistModalOpen}
        onOpenChange={setPlaylistModalOpen}
      />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Playlists</h1>
          <p className="text-xs text-muted-foreground">
            Collections you have created
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => setPlaylistModalOpen(true)}
        >
          <PlusIcon />
        </Button>
      </div>
      <PlaylistsSection />
    </div>
  );
};
