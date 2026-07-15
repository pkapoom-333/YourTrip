"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Type, Trash2, Check } from "lucide-react";

interface TextSticker {
  id: string;
  text: string;
  x: number; // 0–1 (relative to canvas width)
  y: number; // 0–1 (relative to canvas height)
  color: string;
  fontSize: number; // px (on 400px canvas)
  bgOpacity: number; // 0–1
}

const COLORS = ["#FFFFFF", "#000000", "#FFD700", "#FF4F4F", "#48BB78", "#398AB9", "#A78BFA"];

interface StoryTextEditorProps {
  imageDataUrl: string; // original image as data URL
  onDone: (composited: Blob) => void;
  onCancel: () => void;
}

export default function StoryTextEditor({ imageDataUrl, onDone, onCancel }: StoryTextEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stickers, setStickers] = useState<TextSticker[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingColor, setEditingColor] = useState("#FFFFFF");
  const [showInput, setShowInput] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const [rendering, setRendering] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      draw();
    };
    img.src = imageDataUrl;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDataUrl]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw base image scaled to canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const dx = (canvas.width - img.width * scale) / 2;
    const dy = (canvas.height - img.height * scale) / 2;
    ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);

    // Draw stickers
    for (const s of stickers) {
      const px = s.x * canvas.width;
      const py = s.y * canvas.height;
      ctx.font = `bold ${s.fontSize}px "Noto Sans Thai", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const metrics = ctx.measureText(s.text);
      const tw = metrics.width + 24;
      const th = s.fontSize + 16;

      if (s.bgOpacity > 0) {
        ctx.fillStyle = `rgba(0,0,0,${s.bgOpacity})`;
        ctx.beginPath();
        ctx.roundRect(px - tw / 2, py - th / 2, tw, th, 8);
        ctx.fill();
      }

      ctx.fillStyle = s.color;
      ctx.fillText(s.text, px, py);

      // selection indicator
      if (s.id === selected) {
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(px - tw / 2 - 4, py - th / 2 - 4, tw + 8, th + 8);
        ctx.setLineDash([]);
      }
    }
  }, [stickers, selected]);

  useEffect(() => { draw(); }, [draw]);

  function addTextSticker() {
    if (!editingText.trim()) return;
    const id = crypto.randomUUID();
    setStickers((prev) => [
      ...prev,
      { id, text: editingText.trim(), x: 0.5, y: 0.5, color: editingColor, fontSize: 28, bgOpacity: 0.5 },
    ]);
    setSelected(id);
    setEditingText("");
    setShowInput(false);
  }

  function deleteSelected() {
    setStickers((prev) => prev.filter((s) => s.id !== selected));
    setSelected(null);
  }

  // Canvas click: select sticker or deselect
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Find hit sticker (reverse order = top first)
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      const px = s.x * canvas.width;
      const py = s.y * canvas.height;
      ctx.font = `bold ${s.fontSize}px sans-serif`;
      const tw = ctx.measureText(s.text).width + 24;
      const th = s.fontSize + 16;
      if (cx >= px - tw / 2 && cx <= px + tw / 2 && cy >= py - th / 2 && cy <= py + th / 2) {
        setSelected(s.id);
        setDragOffset({ dx: cx - px, dy: cy - py });
        return;
      }
    }
    setSelected(null);
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!selected || !dragOffset) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const nx = Math.max(0.05, Math.min(0.95, (cx - dragOffset.dx) / canvas.width));
    const ny = Math.max(0.05, Math.min(0.95, (cy - dragOffset.dy) / canvas.height));
    setStickers((prev) => prev.map((s) => s.id === selected ? { ...s, x: nx, y: ny } : s));
  }

  function handleCanvasMouseUp() {
    setDragOffset(null);
  }

  async function handleDone() {
    setRendering(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Render without selection outline
    const prevSelected = selected;
    setSelected(null);
    // Draw one more time without selection
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        draw();
        resolve();
      });
    });
    canvas.toBlob((blob) => {
      if (blob) onDone(blob);
      setSelected(prevSelected);
      setRendering(false);
    }, "image/jpeg", 0.92);
  }

  return (
    <div className="fixed inset-0 z-[95] bg-black flex flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-3 z-10">
        <button onClick={onCancel} className="text-white/70 hover:text-white text-sm px-3 py-1.5">
          ยกเลิก
        </button>
        <div className="flex items-center gap-2">
          {selected && (
            <button onClick={deleteSelected} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => { setShowInput(true); setSelected(null); }}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-sm"
          >
            <Type className="w-3.5 h-3.5" /> ข้อความ
          </button>
        </div>
        <button
          onClick={() => void handleDone()}
          disabled={rendering}
          className="bg-[#398AB9] text-white px-4 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> เสร็จ
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center px-2">
        <canvas
          ref={canvasRef}
          width={400}
          height={711}
          className="max-h-full max-w-full object-contain rounded-xl"
          style={{ cursor: dragOffset ? "grabbing" : selected ? "grab" : "default" }}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Text input overlay */}
      {showInput && (
        <div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center p-6 gap-4">
          <div className="flex gap-2 mb-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setEditingColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-transform"
                style={{
                  background: c,
                  borderColor: c === editingColor ? "white" : "transparent",
                  transform: c === editingColor ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <input
            autoFocus
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addTextSticker(); if (e.key === "Escape") setShowInput(false); }}
            placeholder="พิมพ์ข้อความ..."
            maxLength={60}
            className="w-full max-w-xs text-center bg-transparent text-white text-xl font-bold placeholder-white/40 outline-none border-b-2 border-white/50 focus:border-white pb-2"
            style={{ color: editingColor }}
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowInput(false)}
              className="px-5 py-2 rounded-xl bg-white/20 text-white text-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={addTextSticker}
              disabled={!editingText.trim()}
              className="px-5 py-2 rounded-xl bg-[#398AB9] text-white text-sm font-semibold disabled:opacity-40"
            >
              เพิ่ม
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
