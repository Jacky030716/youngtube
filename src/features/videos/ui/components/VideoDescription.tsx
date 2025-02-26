import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface VideoDescriptionProps {
  description?: string | null;
  compactViews: string;
  expandedViews: string;
  compactDate: string;
  expandedDate: string;
}

export const VideoDescription = ({
  description,
  compactDate,
  expandedDate,
  expandedViews,
  compactViews,
}: VideoDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
      onClick={() => setIsExpanded((prev) => !prev)}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{isExpanded ? expandedViews : compactViews} views</span>
        <span>{isExpanded ? expandedDate : compactDate} </span>
      </div>
      <div className="relative mt-1">
        <p
          className={cn(
            "text-sm whitespace-pre-wrap",
            !isExpanded && "line-clamp-2",
          )}
        >
          {description || "No description"}
        </p>
        <div className="flex items-center gap-1 text-sm font-medium mt-4">
          {isExpanded ? <span>Show less</span> : <span>Show more</span>}
          <ChevronDown
            className={cn(
              "duration-150 transition-transform size-3",
              isExpanded ? "rotate-180" : "rotate-0",
            )}
          />
        </div>
      </div>
    </div>
  );
};
