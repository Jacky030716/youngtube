"use client";

import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { StudioUploader } from "@/features/studio/ui/components/StudioUploader";
import { useRouter } from "next/navigation";

export const StudioUploadModal = () => {
  const router = useRouter();

  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video created");
      utils.studio.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSuccess = () => {
    if (!create.data?.video.id) return;

    create.reset();
    router.push(`/studio/videos/${create.data.video.id}`);
  };

  const isDisabled = create.isPending;

  return (
    <>
      <ResponsiveDialog
        title="Upload a Video"
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data.url} onSuccess={onSuccess} />
        ) : (
          <Loader2Icon className="animate-spin" />
        )}
      </ResponsiveDialog>
      <Button
        variant="secondary"
        onClick={() => create.mutate()}
        disabled={isDisabled}
      >
        {isDisabled ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
        {isDisabled ? "Creating..." : "Create"}
      </Button>
    </>
  );
};
