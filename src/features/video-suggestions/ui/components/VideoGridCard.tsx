import { VideoSuggestionsGetManyOutput } from "@/features/videos/types";
import {
  VideoThumbnail,
  VideoThumbnailSkeleton,
} from "@/features/videos/ui/components/VideoThumbnail";
import Link from "next/link";
import { VideoInfo, VideoInfoSkeleton } from "./VideoInfo";

interface VideoGridCardProps {
  data: VideoSuggestionsGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => (
  <div className="flex flex-col gap-2 w-full">
    <VideoThumbnailSkeleton />
    <VideoInfoSkeleton />
  </div>
);

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link prefetch href={`/videos/${data.id}`}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration ?? 0}
        />
      </Link>
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
};
