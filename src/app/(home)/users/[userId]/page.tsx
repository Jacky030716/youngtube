import { DEFAULT_LIMIT } from "@/constants";
import { UserView } from "@/features/users/ui/views/UserView";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

interface UserPageProps {
  params: Promise<{ userId: string }>;
}

const UserPage = async ({ params }: UserPageProps) => {
  const { userId } = await params;

  void trpc.users.getOne.prefetch({ id: userId });
  void trpc.videos.getMany.prefetchInfinite({ userId, limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  );
};

export default UserPage;
