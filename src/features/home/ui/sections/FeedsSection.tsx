"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard } from "@/features/video-suggestions/ui/components/VideoGridCard";
import { VideoRowCard } from "@/features/video-suggestions/ui/components/VideoRowCard";
import { trpc } from "@/trpc/client";

export const FeedsSection = () => {
  const [videos] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <div className="w-full grid grid-cols-3 gap-4">
      {videos.pages
        .flatMap((page) => page.items)
        .map((video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
    </div>
  );
};
