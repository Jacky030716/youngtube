"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const VideoSuggestions = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Something went wrong...</p>}>
        <VideoSuggestionsSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSuggestionsSuspense = () => {
  return <div>Video Suggestion</div>;
};
