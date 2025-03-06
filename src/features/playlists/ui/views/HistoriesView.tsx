import { HistoryVideosSection } from "../sections/HistoryVideosSection";

export const HistoriesView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Video Histories</h1>
        <p className="text-xs text-muted-foreground">Videos you have watched</p>
      </div>
      <HistoryVideosSection />
    </div>
  );
};
