"use client";

import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId?: string | null | undefined;
  thumbnail?: string | null | undefined;
  autoPLay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayerSkeleton = () => (
  <div className="aspect-video rounded-xl bg-black" />
);

export const VideoPlayer = ({
  playbackId,
  thumbnail,
  autoPLay,
  onPlay,
}: VideoPlayerProps) => {
  if (!playbackId) return null;

  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={thumbnail || "/placeholder.svg"}
      playerInitTime={0}
      autoPlay={autoPLay}
      thumbnailTime={0}
      className="size-full object-contain"
      accentColor="#ff2056"
      onPlay={onPlay}
    />
  );
};
