import Image from "next/image";

interface VideoThumbnailProps {
  imageUrl?: string;
}

export const VideoThumbnail = ({ imageUrl }: VideoThumbnailProps) => {
  return (
    <div className="relative">
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={imageUrl ?? "/placeholder.png"}
          alt="Thumbnail"
          fill
          className="size-full object-cover"
        />
      </div>
    </div>
  );
};
