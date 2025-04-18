import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps extends VariantProps<typeof avatarVariant> {
  imageUrl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}

const avatarVariant = cva("", {
  variants: {
    size: {
      default: "h-9 w-9",
      xs: "h-4 w-4",
      sm: "h-6 w-6",
      lg: "h-10 w-10",
      xl: "h-[160px] w-[160px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export const UserAvatar = ({
  imageUrl,
  name,
  className,
  onClick,
  size,
}: UserAvatarProps) => {
  return (
    <Avatar
      className={cn(avatarVariant({ size, className }))}
      onClick={onClick}
    >
      <AvatarImage src={imageUrl} alt={name} className="object-cover" />
    </Avatar>
  );
};
