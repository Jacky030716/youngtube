import { SingleVideoSection } from "@/features/videos/ui/sections/SingleVideoSection";
import { VideoSuggestions } from "@/features/videos/ui/sections/VideoSuggestions";
import { CommentsSection } from "@/features/videos/ui/sections/CommentsSection";

interface SingleVideoViewProps {
  videoId: string;
}

export const SingleVideoView = ({ videoId }: SingleVideoViewProps) => {
  return (
    <div className="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <SingleVideoSection videoId={videoId} />
          <div className="xl:hidden block mt-3">
            <VideoSuggestions videoId={videoId} isManual />
          </div>
          <CommentsSection videoId={videoId} />
        </div>
        <div className="max-xl:hidden w-full xl:w-[380px] 2xl:w-[460px] shrink-[1]">
          <VideoSuggestions videoId={videoId} />
        </div>
      </div>
    </div>
  );
};
