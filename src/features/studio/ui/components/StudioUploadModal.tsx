"use client";

import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { ReponsiveDialog } from "@/components/ResponsiveDialog";
import { StudioUploader } from "@/features/studio/ui/components/StudioUploader";

export const StudioUploadModal = () => {
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

  const isDisabled = create.isPending;

  return (
    <>
      <ReponsiveDialog
        title="Upload a Video"
        open={!!create.data?.url}
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data.url} onSuccess={() => {}} />
        ) : (
          <Loader2Icon className="animate-spin" />
        )}
      </ReponsiveDialog>
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
