"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { insertBoard } from "@/lib/server/boards";
import type { BoardDefinition, BoardLocation } from "@/lib/types";

export interface CreateBoardResult {
  error: string;
}

export async function createBoardAction(
  definition: BoardDefinition,
  location: BoardLocation | null,
  isPublic: boolean
): Promise<CreateBoardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/create");

  let id: string;
  try {
    ({ id } = await insertBoard(definition, location, isPublic));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create board" };
  }
  redirect(`/boards/${id}`);
}
