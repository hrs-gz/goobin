"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { get, set } from "idb-keyval";
import { toPng } from "html-to-image";
import { processImageFile } from "@/lib/photo";
import { downloadBlob } from "@/lib/export";
import styles from "./demo.module.css";

const BOARD_TITLE = "Non Slop hackathon";
const COLLECTION = "COLLECTION 004";
const STORAGE_KEY = "goobin-demo-non-slop-v1";

const PROMPTS = [
  "Guy named Donald",
  "Someone cute",
  "Someone w glasses",
  "Someone with red hair",
  "Someone much taller than u",
  "Someone wearing a hat",
  "Someone with a tuff fit",
  "Someone with nice shoes",
  "Someone doing a handstand",
];

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const TREATMENTS = [
  { id: "field", label: "Field", name: "FIELD NOTES", print: "FIELD JOURNAL" },
  { id: "city", label: "City", name: "CITY NOTES", print: "CITY CONTACT SHEET" },
  { id: "studio", label: "Studio", name: "STUDIO NOTES", print: "EXHIBITION POSTER" },
] as const;

type TreatmentId = (typeof TREATMENTS)[number]["id"];
type Photos = (string | null)[];

interface SavedState {
  photos: Photos;
  name: string;
  treatment: TreatmentId;
}

const EMPTY: Photos = PROMPTS.map(() => null);

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function DemoBoard() {
  const [photos, setPhotos] = useState<Photos>(EMPTY);
  const [name, setName] = useState("");
  const [treatment, setTreatment] = useState<TreatmentId>("field");
  const [view, setView] = useState<"board" | "print">("board");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const pendingIndex = useRef<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    get<SavedState>(STORAGE_KEY)
      .then((saved) => {
        if (cancelled || !saved) return;
        if (Array.isArray(saved.photos) && saved.photos.length === PROMPTS.length) {
          setPhotos(saved.photos);
        }
        if (typeof saved.name === "string") setName(saved.name);
        if (TREATMENTS.some((t) => t.id === saved.treatment)) {
          setTreatment(saved.treatment);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        setToday(new Date().toLocaleDateString("en-CA"));
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    set(STORAGE_KEY, { photos, name, treatment } satisfies SavedState).catch(() => {});
  }, [loaded, photos, name, treatment]);

  const count = photos.filter(Boolean).length;
  const total = PROMPTS.length;
  const t = TREATMENTS.find((x) => x.id === treatment) ?? TREATMENTS[0];

  const { hasLine, nextIndex, status } = useMemo(() => {
    const filled = (i: number) => photos[i] !== null;
    const done = LINES.some((line) => line.every(filled));
    const almost = LINES.find((line) => line.filter(filled).length === 2);
    const firstEmpty = photos.findIndex((p) => p === null);
    const next = done || !almost ? firstEmpty : almost.find((i) => !filled(i)) ?? firstEmpty;
    let text = "Tap a square to add a photo.";
    if (count === total) text = "Full board. Go get your print.";
    else if (done) text = "Line! Keep going for the full board.";
    else if (almost) text = "One square from a line.";
    else if (count > 0) text = "Nice. Keep collecting.";
    return { hasLine: done, nextIndex: next, status: text };
  }, [photos, count, total]);

  const pickPhoto = useCallback((index: number) => {
    pendingIndex.current = index;
    setOpenIndex(null);
    fileInput.current?.click();
  }, []);

  const onFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = pendingIndex.current;
    e.target.value = "";
    if (!file || index === null) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await processImageFile(file);
      const url = await blobToDataUrl(blob);
      setPhotos((prev) => prev.map((p, i) => (i === index ? url : p)));
    } catch {
      setError("That photo couldn't be read. Try another one.");
    } finally {
      setBusy(false);
    }
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? null : p)));
    setOpenIndex(null);
  }, []);

  const resetBoard = useCallback(() => {
    if (!window.confirm("Clear all nine photos from this board?")) return;
    setPhotos(EMPTY);
    setView("board");
  }, []);

  const renderPrint = useCallback(async (): Promise<Blob | null> => {
    if (!printRef.current) return null;
    const dataUrl = await toPng(printRef.current, { pixelRatio: 3, cacheBust: true });
    const res = await fetch(dataUrl);
    return res.blob();
  }, []);

  const savePrint = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await renderPrint();
      if (blob) downloadBlob(blob, "goobin-non-slop-hackathon.png");
    } catch {
      setError("Couldn't make the image. Try again.");
    } finally {
      setBusy(false);
    }
  }, [renderPrint]);

  const sharePrint = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await renderPrint();
      if (!blob) return;
      const file = new File([blob], "goobin-non-slop-hackathon.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: BOARD_TITLE, text: "My goobin board", files: [file] });
      } else {
        downloadBlob(blob, "goobin-non-slop-hackathon.png");
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError("Couldn't share the image. Try saving it instead.");
      }
    } finally {
      setBusy(false);
    }
  }, [renderPrint]);

  const openPhoto = openIndex !== null ? photos[openIndex] : null;

  return (
    <div className={styles.root} data-t={treatment}>
      <div className={styles.column}>
        <div className={styles.strip}>
          <span>GOOBIN / {t.name}</span>
          <span>{COLLECTION}</span>
        </div>

        <header className={styles.header}>
          <div className={styles.headText}>
            <h1 className={styles.title}>{BOARD_TITLE}</h1>
            <div className={styles.meta}>
              {pad(total)} SQUARES · {hasLine ? "LINE MADE" : "LINE WINS"}
            </div>
          </div>
          <div className={styles.counter} aria-label={`${count} of ${total} squares filled`}>
            {pad(count)}/{pad(total)}
          </div>
        </header>

        <div className={styles.switcher} role="group" aria-label="Board treatment">
          {TREATMENTS.map((x) => (
            <button
              key={x.id}
              type="button"
              className={styles.switch}
              aria-pressed={x.id === treatment}
              onClick={() => setTreatment(x.id)}
            >
              {x.label}
            </button>
          ))}
        </div>

        {view === "board" ? (
          <>
            <p className={styles.status} aria-live="polite">
              {status}
            </p>

            <div className={styles.grid}>
              {PROMPTS.map((prompt, i) => {
                const photo = photos[i];
                const isNext = !photo && i === nextIndex;
                return (
                  <button
                    key={prompt}
                    type="button"
                    className={styles.cell}
                    data-filled={photo ? "true" : "false"}
                    data-next={isNext ? "true" : "false"}
                    onClick={() => (photo ? setOpenIndex(i) : pickPhoto(i))}
                    aria-label={
                      photo ? `Square ${i + 1}, ${prompt}, photo added` : `Square ${i + 1}, ${prompt}, add a photo`
                    }
                  >
                    {photo ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt="" className={styles.photo} />
                        <span className={styles.chip}>{pad(i + 1)}</span>
                      </>
                    ) : (
                      <>
                        <span className={styles.no}>
                          {pad(i + 1)}
                          {isNext ? " NEXT" : ""}
                        </span>
                        <span className={styles.prompt}>{prompt}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primary}
                disabled={busy || count === total}
                onClick={() => nextIndex >= 0 && pickPhoto(nextIndex)}
              >
                {busy ? "Adding…" : count === total ? "Board complete" : `Snap square ${pad(nextIndex + 1)}`}
              </button>
              <button
                type="button"
                className={styles.secondary}
                disabled={count === 0}
                onClick={() => setView("print")}
              >
                Print
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.status}>
              {count === total ? "Board complete. Here is your print." : `Your print so far: ${count} of ${total}.`}
            </p>

            <div className={styles.printWrap}>
              <div className={styles.print} ref={printRef}>
                <div className={styles.printStrip}>
                  <span>GOOBIN / {COLLECTION}</span>
                  <span>
                    {pad(count)}/{pad(total)}
                  </span>
                </div>
                <div className={styles.printHead}>
                  <div className={styles.printTitle}>{BOARD_TITLE}</div>
                  <div className={styles.printMeta}>
                    {today}
                    {name.trim() ? ` · ${name.trim().toUpperCase()}` : ""}
                  </div>
                </div>
                <div className={styles.printGrid}>
                  {PROMPTS.map((prompt, i) => (
                    <div key={prompt} className={styles.printCell}>
                      <div className={styles.printPhoto}>
                        {photos[i] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photos[i] as string} alt="" className={styles.photo} />
                        ) : null}
                      </div>
                      <div className={styles.printLabel}>
                        <span>{pad(i + 1)}</span> {prompt}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.printFoot}>
                  <span>{t.print}</span>
                  <span className={styles.wordmark}>goobin</span>
                </div>
              </div>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>YOUR NAME ON THE PRINT</span>
              <input
                className={styles.input}
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
              />
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}

            <div className={styles.actions}>
              <button type="button" className={styles.primary} disabled={busy} onClick={sharePrint}>
                {busy ? "Working…" : "Share print"}
              </button>
              <button type="button" className={styles.secondary} disabled={busy} onClick={savePrint}>
                Save
              </button>
            </div>
            <div className={styles.links}>
              <button type="button" className={styles.link} onClick={() => setView("board")}>
                Back to board
              </button>
              <button type="button" className={styles.link} onClick={resetBoard}>
                Start over
              </button>
            </div>
          </>
        )}

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className={styles.hidden}
          onChange={onFile}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {openIndex !== null && openPhoto ? (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Square ${openIndex + 1}: ${PROMPTS[openIndex]}`}
          onClick={() => setOpenIndex(null)}
        >
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetStrip}>
              <span>NO. {pad(openIndex + 1)}</span>
              <span>{today}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={openPhoto} alt="" className={styles.sheetPhoto} />
            <div className={styles.sheetPrompt}>{PROMPTS[openIndex]}</div>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={() => pickPhoto(openIndex)}>
                Retake
              </button>
              <button type="button" className={styles.secondary} onClick={() => removePhoto(openIndex)}>
                Remove
              </button>
            </div>
            <button type="button" className={styles.link} onClick={() => setOpenIndex(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
