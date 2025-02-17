interface SingleVideoPageProps {
  params: Promise<{ videoId: string }>;
}

const SingleVideoPage = async ({ params }: SingleVideoPageProps) => {
  const { videoId } = await params;

  return <div>{videoId}</div>;
};

export default SingleVideoPage;
