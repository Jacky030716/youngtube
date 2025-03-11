import { SinglePlaylistHeader } from "../sections/SinglePlaylistHeader";
import { SinglePlaylistVideoSection } from "../sections/SinglePlaylistVideoSection";

interface SinglePlaylistViewProps {
  playlistId: string;
}

export const SinglePlaylistView = ({ playlistId }: SinglePlaylistViewProps) => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <SinglePlaylistHeader playlistId={playlistId} />
      <SinglePlaylistVideoSection playlistId={playlistId} />
    </div>
  );
};
