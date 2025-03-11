import Link from "next/link";
import { PlaylistsGetManyOutput } from "../../types";
import { ThumbnailFallback } from "@/constants";
import {
  PlaylistThumbnail,
  PlaylistThumbnailSkeleton,
} from "./PlaylistThumbnail";
import { PlaylistInfo, PlaylistInfoSkeleton } from "./PlaylistInfo";

interface PlaylistGridCardProps {
  data: PlaylistsGetManyOutput["items"][number];
}

export const PlaylistGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton />
    </div>
  );
};

export const PlaylistGridCard = ({ data }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlists/${data.id}`}>
      <div className="flex flex-col gap-2 group">
        <PlaylistThumbnail
          imageUrl={data.thumbnailUrl || ThumbnailFallback}
          title={data.name}
          videoCount={data.videoCount}
        />
        <PlaylistInfo data={data} />
      </div>
    </Link>
  );
};
