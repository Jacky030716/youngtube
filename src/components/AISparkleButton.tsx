import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AISparkleButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const AISparkleButton = ({
  onClick,
  disabled,
}: AISparkleButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className="rounded-full size-6 [&_svg}:size-3 group"
          >
            {disabled ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SparklesIcon className="size-4 group-hover:rotate-90 duration-500 cursor-pointer transition-transform ease-in-out group-hover:fill-yellow-300" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>AI-generated</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
