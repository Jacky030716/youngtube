import { SubscribedVideosSection } from "../sections/SubscribedVideosSection";

export const SubscriptionView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Subscriptions</h1>
        <p className="text-xs text-muted-foreground">
          Videos from your favourite creators
        </p>
      </div>
      <SubscribedVideosSection />
    </div>
  );
};
