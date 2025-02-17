import { HomeView } from "@/features/home/ui/views/HomeView";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

const Home = async ({ searchParams }: HomePageProps) => {
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Home;
