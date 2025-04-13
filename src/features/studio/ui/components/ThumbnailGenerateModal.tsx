import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { trpc } from "@/trpc/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { pollWorkflowStatus } from "../../utils/pollWorkflowStatus";

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  prompt: z.string().min(10),
});

type FormValues = z.infer<typeof formSchema>;

export const ThumbnailGenerateModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailGenerateModalProps) => {
  const utils = trpc.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: async ({ workflowRunId }) => {
      toast.success("Generating thumbnail", {
        description: "This may take a while",
      });

      onOpenChange(false);

      const { status } = await pollWorkflowStatus(workflowRunId);

      if (status === "success") {
        toast.success("Thumbnail generated successfully");

        void utils.studio.getMany.invalidate();
        void utils.studio.getOne.invalidate({ id: videoId });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: FormValues) => {
    generateThumbnail.mutate({
      id: videoId,
      prompt: values.prompt,
    });
  };

  const isDisabled = generateThumbnail.isPending;

  return (
    <ResponsiveDialog
      title="Generate a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4 px-4 py-2"
        >
          <FormField
            name="prompt"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    cols={30}
                    rows={5}
                    placeholder="A descriptive prompt for your thumbnail"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex md:justify-end justify-center">
            <Button type="submit" disabled={isDisabled}>
              {isDisabled ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
