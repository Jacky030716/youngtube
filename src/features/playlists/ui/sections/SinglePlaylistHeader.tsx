"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface SinglePlaylistHeaderProps {
  playlistId: string;
}

export const SinglePlaylistHeader = ({
  playlistId,
}: SinglePlaylistHeaderProps) => {
  return (
    <Suspense fallback={<SinglePlaylistHeaderSkeleton />}>
      <ErrorBoundary fallback={<p>Something went wrong...</p>}>
        <PlaylistHeaderSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const SinglePlaylistHeaderSkeleton = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col gap-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
};

const PlaylistHeaderSuspense = ({ playlistId }: SinglePlaylistHeaderProps) => {
  const utils = trpc.useUtils();
  const router = useRouter();

  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ playlistId });
  const removePlaylist = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist removed");
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold capitalize">{playlist.name}</h1>
        <p className="text-xs text-muted-foreground">
          Videos from the playlists
        </p>
      </div>
      <Button
        variant="outline"
        className="rounded-full"
        size="icon"
        onClick={() =>
          removePlaylist.mutate({
            playlistId,
          })
        }
        disabled={removePlaylist.isPending}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
};
