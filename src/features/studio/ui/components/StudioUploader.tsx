import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudioUploaderProps {
  endpoint?: string | null;
  onSuccess: () => void;
}

export const StudioUploader = ({
  endpoint,
  onSuccess,
}: StudioUploaderProps) => {
  const MUX_ID = "video-uploader";

  return (
    <div>
      <MuxUploader
        endpoint={endpoint}
        id={MUX_ID}
        className="hidden group/uploader"
        onSuccess={onSuccess}
      />
      <MuxUploaderDrop muxUploader={MUX_ID} className="group/drop">
        <div slot="heading" className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-2 rounded-full bg-muted h-32 w-32">
            <UploadIcon className="size-10 text-muted-foreground group/drop-[&[active]]:animate-bounce transition-all duration-200" />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm">Drag and drop video files to upload</p>
            <p className="text-xs text-muted-foreground">
              Your videos will be private until you publish them
            </p>
          </div>
          <MuxUploaderFileSelect muxUploader={MUX_ID}>
            <Button type="button" className="rounded-full">
              Select Files
            </Button>
          </MuxUploaderFileSelect>
        </div>
        <span slot="separator" className="hidden" />
        <MuxUploaderStatus muxUploader={MUX_ID} className="text-sm" />
        <MuxUploaderProgress
          muxUploader={MUX_ID}
          className="text-sm"
          type="percentage"
        />
        <MuxUploaderProgress muxUploader={MUX_ID} type="bar" />
      </MuxUploaderDrop>
    </div>
  );
};
