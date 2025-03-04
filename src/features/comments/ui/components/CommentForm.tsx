import { useClerk } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { comments } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { UserAvatar } from "@/components/UserAvatar";
import { z } from "zod";
import { trpc } from "@/trpc/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CommentFormProps {
  videoId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "reply" | "comment";
}

const commentsInsertSchema = createInsertSchema(comments);
const formSchema = commentsInsertSchema.omit({ userId: true });
type FormValues = z.infer<typeof formSchema>;

export const CommentForm = ({
  videoId,
  parentId,
  onSuccess,
  onCancel,
  variant,
}: CommentFormProps) => {
  const clerk = useClerk();
  const { user } = useClerk();
  const utils = trpc.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentId: parentId ?? null,
      videoId,
      value: "",
    },
  });

  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      void utils.comments.getMany.invalidate({ videoId });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
      toast.error(error.data?.code);
    },
  });

  const onSubmit = (values: FormValues) => {
    create.mutate(values);
  };

  return (
    <div className="w-full flex gap-2">
      <UserAvatar
        imageUrl={user?.imageUrl || "/placeholder.svg"}
        name={user?.username || "User"}
      />
      <div className="flex-1 flex flex-col gap-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-2"
          >
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={
                        variant === "reply"
                          ? "Reply to this comment..."
                          : "Add a comment..."
                      }
                      className="w-full resize-none text-sm"
                      rows={2}
                      cols={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    form.reset();
                    onCancel?.();
                  }}
                  disabled={create.isPending}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={create.isPending}>
                {variant === "reply" ? "Reply" : "Comment"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
