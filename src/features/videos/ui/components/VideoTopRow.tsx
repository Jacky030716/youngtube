import { useMemo } from "react";
import { VideoGetOneOutput } from "@/features/videos/types";
import { VideoOwner } from "@/features/videos/ui/components/VideoOwner";
import { VideoDescription } from "@/features/videos/ui/components/VideoDescription";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoTopRowProps {
  video: VideoGetOneOutput;
}

export const VideoTopRowSkeleton = () => (
  <div className="flex flex-col gap-4 mt-4">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-6 w-4/5 md:w-2/5" />
    </div>
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2 w-[70%]">
        <Skeleton className="size-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-5 w-4/5 md:w-2/6" />
          <Skeleton className="h-5 w-3/5 md:w-1/5" />
        </div>
      </div>
      <Skeleton className="h-9 w-2/6 md:1/6 rounded-full" />
    </div>
    <div className="h-[120px] w-full" />
  </div>
);

export const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
    }).format(video.viewsCount);
  }, [video.viewsCount]);

  const expandedViews = useMemo(() => {
    return Intl.NumberFormat("en-US", {
      notation: "standard",
    }).format(video.viewsCount);
  }, [video.viewsCount]);

  const compactDate = formatDistanceToNow(new Date(video.createdAt), {
    addSuffix: true,
  });

  const expandedDate = format(new Date(video.createdAt), "dd MMM yyyy");

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>
      <div className="flex max-sm:flex-col sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} video={video} />
      </div>
      <VideoDescription
        description={video.description}
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
      />
    </div>
  );
};
