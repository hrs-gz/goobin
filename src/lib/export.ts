import { toPng } from "html-to-image";

export async function exportBoardElement(element: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue(
      "--bg-page"
    ) || "#f7f5f2",
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function shareBoardBlob(blob: Blob, title: string): Promise<boolean> {
  if (!navigator.share) return false;

  const file = new File([blob], "goobin-board.png", { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title,
        text: "My goobin board",
        files: [file],
      });
      return true;
    }
    await navigator.share({ title, text: "My goobin board" });
    return true;
  } catch {
    return false;
  }
}
