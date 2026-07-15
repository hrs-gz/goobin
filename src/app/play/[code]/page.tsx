import type { Metadata } from "next";
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

  return (
    <>
      <AppHeader />
      <PlayBoard board={board} />
    </>
  );
}
