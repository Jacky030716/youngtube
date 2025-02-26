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

interface CommentFormProps {
  videoId: string;
}

const commentsInsertSchema = createInsertSchema(comments);
const formSchema = commentsInsertSchema.omit({ userId: true });
type FormValues = z.infer<typeof formSchema>;

export const CommentForm = ({ videoId }: CommentFormProps) => {
  const clerk = useClerk();
  const { user } = useClerk();
  const utils = trpc.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId,
      value: "",
    },
  });

  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      void utils.comments.getMany.invalidate({ videoId });
      form.reset();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  const onSubmit = (values: FormValues) => {
    create.mutate(values); // Uncommented this line to actually submit the form
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
                      placeholder="Add a comment..."
                      className="w-full resize-none"
                      rows={3}
                      cols={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={create.isPending}>
                Comment
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
