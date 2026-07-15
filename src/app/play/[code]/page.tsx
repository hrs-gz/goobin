import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { PlayBoard } from "@/components/play/PlayBoard";
import { getBoardByCode } from "@/lib/server/boards";
import { isValidJoinCode } from "@/lib/joinCode";

export async function generateMetadata(
  props: PageProps<"/play/[code]">
): Promise<Metadata> {
  const { code } = await props.params;
  if (!isValidJoinCode(code)) return { title: "Board not found" };
  const board = await getBoardByCode(code);
  if (!board) return { title: "Board not found" };
  return {
    title: board.title,
    description: `Play “${board.title}” photo bingo on goobin.`,
  };
}

export default async function PlayPage(props: PageProps<"/play/[code]">) {
  const { code } = await props.params;
  if (!isValidJoinCode(code)) notFound();

  const board = await getBoardByCode(code);
  if (!board) notFound();

  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "";

  return (
    <>
      <AppHeader />
      <PlayBoard board={board} origin={origin} />
    </>
  );
}
