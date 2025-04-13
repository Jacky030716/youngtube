"use client";

import { z } from "zod";
import { Suspense, useState } from "react";
import { trpc } from "@/trpc/client";
import { videoUpdateSchema } from "@/db/schema";
import { ErrorBoundary } from "react-error-boundary";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlayIcon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparkleIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VideoPlayer } from "@/features/videos/ui/components/VideoPlayer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThumbnailUploadModal } from "@/features/studio/ui/components/ThumbnailUploadModal";
import { AISparkleButton } from "@/components/AISparkleButton";
import { ThumbnailGenerateModal } from "@/features/studio/ui/components/ThumbnailGenerateModal";
import { APP_URL } from "@/constants";
import { pollWorkflowStatus } from "../../utils/pollWorkflowStatus";

interface FormSectionProps {
  videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// todo
const FormSectionSkeleton = () => {
  return <div>Loading...</div>;
};

type VideoUpdateInput = z.infer<typeof videoUpdateSchema>;

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const router = useRouter();

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const [isCopied, setIsCopied] = useState(false);
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [thumbnailGenerateOpen, setThumbnailGenerateOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const utils = trpc.useUtils();
  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      void utils.studio.getMany.invalidate();
      void utils.studio.getOne.invalidate({ id: videoId });

      toast.success("Video updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      void utils.studio.getMany.invalidate();
      toast.success("Video deleted successfully");

      router.push("/studio");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: async ({ workflowRunId }) => {
      toast.success("Generating title", {
        description: "This may take a while",
      });

      const { status } = await pollWorkflowStatus(workflowRunId);

      if (status === "success") {
        toast.success("Title generated successfully");

        void utils.studio.getMany.invalidate();
        void utils.studio.getOne.invalidate({ id: videoId });
      } else {
        toast.error("Failed to generate title");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: async ({ workflowRunId }) => {
      toast.success("Generating description", {
        description: "This may take a while",
      });

      const { status } = await pollWorkflowStatus(workflowRunId);

      if (status === "success") {
        toast.success("Description generated successfully");

        void utils.studio.getMany.invalidate();
        void utils.studio.getOne.invalidate({ id: videoId });
      } else {
        toast.error("Failed to generate description");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      void utils.studio.getMany.invalidate();
      void utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Thumbnail restored successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<VideoUpdateInput>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = async (values: VideoUpdateInput) => {
    update.mutate(values);
  };

  const fullUrl = `${APP_URL || "http://localhost:3000"}/videos/${video.id}`;

  return (
    <>
      <ThumbnailUploadModal
        videoId={videoId}
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
      />
      <ThumbnailGenerateModal
        videoId={videoId}
        open={thumbnailGenerateOpen}
        onOpenChange={setThumbnailGenerateOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Video details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your video details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: video.id })}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Title
                      <AISparkleButton
                        onClick={() => generateTitle.mutate({ id: videoId })}
                        disabled={generateTitle.isPending}
                      />
                    </FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a title to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Description
                      <AISparkleButton
                        onClick={() =>
                          generateDescription.mutate({ id: videoId })
                        }
                        disabled={generateDescription.isPending}
                      />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Add a description to your video"
                        rows={10}
                        className="resize-none pr-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="thumbnailUrl"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0.5 border border-dashed border-neutral-500 relative h-[84px] w-[153px] group">
                        <Image
                          src={video.thumbnailUrl ?? "/placeholder.svg"}
                          alt="Thumbnail"
                          fill
                          className="object-cover"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100"
                            >
                              <MoreVerticalIcon className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlayIcon className="size-4 mr-1" />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setThumbnailGenerateOpen(true)}
                            >
                              <SparkleIcon className="size-4 mr-1" />
                              AI-generated
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ id: videoId })
                              }
                            >
                              <RotateCcwIcon className="size-4 mr-1" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnail={video.thumbnailUrl}
                  />
                </div>
                <div className="p-4 flex flex-col gap-6">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">
                        Video Link
                      </p>
                      <div className="flex items-center gap-2">
                        <Link prefetch href={`/videos/${video.id}`}>
                          <p className="text-sm line-clamp-1 text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={handleCopy}
                          disabled={isCopied}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-muted-foreground text-xs">
                        Video Status
                      </p>
                      <p className="capitalize text-sm">
                        {video.muxStatus ?? "preparing"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitle Status
                      </p>
                      <p className="capitalize text-sm">
                        {video.muxTrackStatus ?? "no subtitiles"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="videoVisibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe2Icon className="size-4 mr-2" />
                            <span>Public</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <LockIcon className="size-4 mr-2" />
                            <span>Private</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
