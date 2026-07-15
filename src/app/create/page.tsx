import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BoardBuilder } from "@/components/builder/BoardBuilder";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Create a board" };

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/create");

  return (
    <>
      <AppHeader />
      <BoardBuilder />
    </>
  );
}
