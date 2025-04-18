import { CategoriesSection } from "@/features/home/ui/sections/CategoriesSection";
import { FeedsSection } from "../sections/FeedsSection";

interface HomeViewProps {
  categoryId?: string;
}

export const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <CategoriesSection categoryId={categoryId} />
      <FeedsSection categoryId={categoryId} />
    </div>
  );
};
