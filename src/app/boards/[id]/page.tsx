import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BoardShare } from "@/components/boards/BoardShare";
import { createClient } from "@/lib/supabase/server";
import { getMyBoardOpenCounts, getOwnBoardDetail } from "@/lib/server/boards";

export async function generateMetadata(
  props: PageProps<"/boards/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const board = await getOwnBoardDetail(id);
  return { title: board ? `Share “${board.title}”` : "Board" };
}

export default async function BoardDetailPage(
  props: PageProps<"/boards/[id]">
) {
  const { id } = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/boards/${id}`);

  const board = await getOwnBoardDetail(id);
  if (!board) notFound();

  const opens = await getMyBoardOpenCounts();

  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "";

  return (
    <>
      <AppHeader />
      <BoardShare board={board} opens={opens[board.id] ?? 0} origin={origin} />
    </>
  );
}
