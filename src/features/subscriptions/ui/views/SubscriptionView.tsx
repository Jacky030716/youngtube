import { SubscriptionsSection } from "../sections/SubscriptionsSection";

export const SubscriptionView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions List</h1>
        <p className="text-xs text-muted-foreground">
          View and manage all your subscriptions
        </p>
      </div>
      <SubscriptionsSection />
    </div>
  );
};
