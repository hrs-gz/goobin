"use server";

import { refresh } from "next/cache";
import { deleteBoard, setBoardPublished } from "@/lib/server/boards";

export async function deleteBoardAction(id: string): Promise<void> {
  await deleteBoard(id);
  refresh();
}

export async function setPublishedAction(
  id: string,
  isPublic: boolean
): Promise<void> {
  await setBoardPublished(id, isPublic);
  refresh();
}
