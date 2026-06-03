"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import type { BrushStroke, MarkupData, TextOverlay } from "@/lib/types";
import { MarkupTray, type MarkupTool } from "./MarkupTray";
import { MARKUP_COLORS } from "@/lib/themes";

interface MarkupEditorProps {
  photoUrl: string;
  initialData?: MarkupData;
  onSave: (data: MarkupData) => void;
  onClose: () => void;
}

function useHtmlImage(url: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => setImage(img);
  }, [url]);
  return image;
}

export function MarkupEditor({
  photoUrl,
  initialData,
  onSave,
  onClose,
}: MarkupEditorProps) {
  const [tool, setTool] = useState<MarkupTool>("brush");
  const [color, setColor] = useState<string>(MARKUP_COLORS[0].value);
  const [strokes, setStrokes] = useState<BrushStroke[]>(
    initialData?.brushStrokes ?? []
  );
  const [texts, setTexts] = useState<TextOverlay[]>(
    initialData?.textOverlays ?? []
  );
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [size, setSize] = useState({ width: 300, height: 300 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const bgImage = useHtmlImage(photoUrl);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      setSize({ width: w, height: w });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handlePointerDown = useCallback(() => {
    if (tool === "text") {
      const id = `text-${Date.now()}`;
      setTexts((prev) => [
        ...prev,
        {
          id,
          text: "✨",
          x: size.width / 2 - 10,
          y: size.height / 2 - 10,
          color,
          fontSize: 24,
        },
      ]);
      return;
    }
    isDrawing.current = true;
    setCurrentLine([]);
  }, [tool, color, size]);

  const handlePointerMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isDrawing.current || tool === "text") return;
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      setCurrentLine((prev) => [...prev, pos.x, pos.y]);
    },
    [tool]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current || tool === "text") return;
    isDrawing.current = false;
    if (currentLine.length < 4) {
      setCurrentLine([]);
      return;
    }
    const strokeColor = tool === "eraser" ? "rgba(0,0,0,1)" : color;
    const width = tool === "eraser" ? 24 : 4;
    setStrokes((prev) => [
      ...prev,
      { points: currentLine, color: strokeColor, width },
    ]);
    setCurrentLine([]);
  }, [currentLine, color, tool]);

  const handleSave = () => {
    const hasMarkup = strokes.length > 0 || texts.length > 0;
    onSave({
      brushStrokes: strokes,
      textOverlays: texts,
      hasMarkup,
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        ref={containerRef}
        className="w-full aspect-square squircle overflow-hidden bg-black"
      >
        <Stage
          width={size.width}
          height={size.height}
          onMouseDown={handlePointerDown}
          onMousemove={handlePointerMove}
          onMouseup={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <Layer>
            {bgImage && (
              <KonvaImage
                image={bgImage}
                width={size.width}
                height={size.height}
              />
            )}
            {strokes.map((s, i) => (
              <Line
                key={i}
                points={s.points}
                stroke={s.color}
                strokeWidth={s.width}
                tension={0.4}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  s.width >= 20 ? "destination-out" : "source-over"
                }
              />
            ))}
            {currentLine.length > 0 && (
              <Line
                points={currentLine}
                stroke={tool === "eraser" ? "rgba(0,0,0,1)" : color}
                strokeWidth={tool === "eraser" ? 24 : 4}
                tension={0.4}
                lineCap="round"
                globalCompositeOperation={
                  tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            )}
            {texts.map((t) => (
              <Text
                key={t.id}
                text={t.text}
                x={t.x}
                y={t.y}
                fill={t.color}
                fontSize={t.fontSize}
                draggable
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <MarkupTray
        activeTool={tool}
        activeColor={color}
        onToolChange={setTool}
        onColorChange={setColor}
      />
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 squircle border border-[var(--border-soft)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 squircle bg-[var(--accent)] text-white"
        >
          Save markup
        </button>
      </div>
    </div>
  );
}
