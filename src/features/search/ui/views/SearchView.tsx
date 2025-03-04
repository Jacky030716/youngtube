import { CategoriesSection } from "../sections/CategoriesSection";
import { ResultsSection } from "../sections/ResultsSection";

interface SearchViewProps {
  query: string;
  categoryId: string | undefined;
}

export const SearchView = ({ query, categoryId }: SearchViewProps) => {
  return (
    <div className="max-w-[1300px] mx-auto mb-10 flex flex-col gap-y-6 pt-2.5">
      <CategoriesSection categoryId={categoryId} />
      <ResultsSection query={query} categoryId={categoryId} />
    </div>
  );
};
