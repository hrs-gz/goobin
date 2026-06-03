import { PlayView } from "@/components/PlayView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface CloudPlayPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function CloudPlayPage({ params }: CloudPlayPageProps) {
  const { boardId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/play/cloud/${boardId}`);
  }

  const { data: board } = await supabase
    .from("boards")
    .select("status")
    .eq("id", boardId)
    .maybeSingle();

  if (!board) {
    redirect("/history");
  }

  const readOnly = board.status === "completed";

  return <PlayView cloudBoardId={boardId} readOnly={readOnly} />;
}
