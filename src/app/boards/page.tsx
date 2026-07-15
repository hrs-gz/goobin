import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { BoardListCard } from "@/components/boards/BoardListCard";
import { createClient } from "@/lib/supabase/server";
import { getMyBoardOpenCounts, getOwnBoards } from "@/lib/server/boards";

export const metadata = { title: "My boards" };

export default async function BoardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/boards");

  const [boards, opens] = await Promise.all([
    getOwnBoards(),
    getMyBoardOpenCounts(),
  ]);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-16 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold">My boards</h1>
          <Link href="/create">
            <Button size="sm">
              <Plus size={16} />
              New
            </Button>
          </Link>
        </div>

        {boards.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-[var(--text-muted)]">
              No boards yet. Create your first photo bingo board.
            </p>
            <Link href="/create" className="mt-4 inline-block">
              <Button size="lg">
                <Plus size={18} />
                Create a board
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            {boards.map((board) => (
              <BoardListCard
                key={board.id}
                board={board}
                opens={opens[board.id] ?? 0}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
