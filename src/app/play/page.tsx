import { PlayView } from "@/components/PlayView";

interface PlayPageProps {
  searchParams: Promise<{ b?: string }>;
}

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const params = await searchParams;
  return <PlayView encodedBoard={params.b ?? null} />;
}
