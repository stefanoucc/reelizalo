"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  X,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Plus,
} from "lucide-react";

const SOMA_COLORS = [
  { name: "Petróleo", value: "#015965" },
  { name: "Pino", value: "#006D5A" },
  { name: "Aquamarina", value: "#2FFFCC" },
  { name: "Lavanda", value: "#D4C4FC" },
  { name: "Negro", value: "#051F22" },
  { name: "Blanco", value: "#F7FBFE" },
];

const FONT_OPTIONS = [
  { label: "Saira", value: "Saira, sans-serif" },
  { label: "Manrope", value: "Manrope, sans-serif" },
];

const ALIGNMENT_OPTIONS = [
  { label: "Left", value: "left", icon: AlignLeft },
  { label: "Center", value: "center", icon: AlignCenter },
  { label: "Right", value: "right", icon: AlignRight },
];

interface TextElement {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: "left" | "center" | "right";
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  rotation: number;
  opacity: number;
}

interface CanvasState {
  texts: TextElement[];
  backgroundImage: string | null;
  zoom: number;
  offset: { x: number; y: number };
}

export interface CanvasEditorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: string | null;
  generatedTexts: string[];
  onAddTextToCanvas?: (text: string) => void;
}

export default function CanvasEditor({
  isOpen,
  onClose,
  selectedImage,
  generatedTexts,
  onAddTextToCanvas,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    texts: [],
    backgroundImage: selectedImage,
    zoom: 1,
    offset: { x: 0, y: 0 },
  });
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [selectedTextElement, setSelectedTextElement] = useState<TextElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [customText, setCustomText] = useState("");

  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1080;
  const DISPLAY_WIDTH = 900;
  const DISPLAY_HEIGHT = 900;

  // Save state to history
  const saveToHistory = useCallback((newState: CanvasState) => {
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  }, [history, currentHistoryIndex]);

  // Add text to canvas
  const addTextToCanvas = useCallback((text: string, fromGenerated = false) => {
    const newText: TextElement = {
      id: Date.now(),
      text,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      fontSize: 32,
      fontFamily: FONT_OPTIONS[0].value,
      color: "#F7FBFE",
      alignment: "center",
      strokeColor: "#051F22",
      strokeWidth: 0,
      shadowColor: "#051F22",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      rotation: 0,
      opacity: 1,
    };
    const newState = {
      ...canvasState,
      texts: [...canvasState.texts, newText],
    };
    setCanvasState(newState);
    saveToHistory(newState);
    setSelectedTextElement(newText);
    if (fromGenerated && onAddTextToCanvas) {
      onAddTextToCanvas(text);
    }
  }, [canvasState, saveToHistory, onAddTextToCanvas]);

  // Update text element
  const updateTextElement = useCallback((id: number, updates: Partial<TextElement>) => {
    const newTexts = canvasState.texts.map(text =>
      text.id === id ? { ...text, ...updates } : text
    );
    const newState = { ...canvasState, texts: newTexts };
    setCanvasState(newState);
    saveToHistory(newState);
  }, [canvasState, saveToHistory]);

  // Delete text element
  const deleteTextElement = useCallback((id: number) => {
    const newTexts = canvasState.texts.filter(text => text.id !== id);
    const newState = { ...canvasState, texts: newTexts };
    setCanvasState(newState);
    saveToHistory(newState);
    setSelectedTextElement(null);
  }, [canvasState, saveToHistory]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setCanvasState(history[newIndex]);
    }
  }, [currentHistoryIndex, history]);
  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setCanvasState(history[newIndex]);
    }
  }, [currentHistoryIndex, history]);

  // Draw text elements (must be before drawCanvas)
  const drawTexts = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvasState.texts.forEach(textElement => {
      ctx.save();
      ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
      ctx.textAlign = textElement.alignment as CanvasTextAlign;
      ctx.fillStyle = textElement.color;
      ctx.globalAlpha = textElement.opacity;
      ctx.translate(textElement.x, textElement.y);
      ctx.rotate(textElement.rotation * Math.PI / 180);
      if (textElement.strokeWidth > 0) {
        ctx.strokeStyle = textElement.strokeColor;
        ctx.lineWidth = textElement.strokeWidth;
        ctx.strokeText(textElement.text, 0, 0);
      }
      if (textElement.shadowBlur > 0) {
        ctx.shadowColor = textElement.shadowColor;
        ctx.shadowBlur = textElement.shadowBlur;
        ctx.shadowOffsetX = textElement.shadowOffsetX;
        ctx.shadowOffsetY = textElement.shadowOffsetY;
      }
      ctx.fillText(textElement.text, 0, 0);
      ctx.restore();
    });
  }, [canvasState.texts]);

  // Canvas drawing
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(canvasState.zoom, canvasState.zoom);
    ctx.translate(-canvas.width / 2 + canvasState.offset.x, -canvas.height / 2 + canvasState.offset.y);
    if (canvasState.backgroundImage) {
      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const canvasAspectRatio = canvas.width / canvas.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let drawX = 0;
        let drawY = 0;
        if (aspectRatio > canvasAspectRatio) {
          drawHeight = canvas.width / aspectRatio;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * aspectRatio;
          drawX = (canvas.width - drawWidth) / 2;
        }
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        drawTexts();
      };
      img.src = canvasState.backgroundImage;
    } else {
      drawTexts();
    }
    ctx.restore();
  }, [canvasState, drawTexts]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;
    const clickedText = canvasState.texts.find(text => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      ctx.font = `${text.fontSize}px ${text.fontFamily}`;
      const metrics = ctx.measureText(text.text);
      const textWidth = metrics.width;
      const textHeight = text.fontSize;
      return x >= text.x - textWidth / 2 && x <= text.x + textWidth / 2 && y >= text.y - textHeight && y <= text.y;
    });
    if (clickedText) {
      setSelectedTextElement(clickedText);
      setIsDragging(true);
      setDragStart({ x: x - clickedText.x, y: y - clickedText.y });
    } else {
      setSelectedTextElement(null);
    }
  }, [canvasState.texts]);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedTextElement) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;
    updateTextElement(selectedTextElement.id, {
      x: x - dragStart.x,
      y: y - dragStart.y,
    });
  }, [isDragging, selectedTextElement, dragStart, updateTextElement]);
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Export canvas
  const exportCanvas = useCallback((format: "png" | "jpg", resolution: number = 1080) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = resolution;
    exportCanvas.height = resolution;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;
    const scale = resolution / CANVAS_WIDTH;
    if (canvasState.backgroundImage) {
      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const canvasAspectRatio = exportCanvas.width / exportCanvas.height;
        let drawWidth = exportCanvas.width;
        let drawHeight = exportCanvas.height;
        let drawX = 0;
        let drawY = 0;
        if (aspectRatio > canvasAspectRatio) {
          drawHeight = exportCanvas.width / aspectRatio;
          drawY = (exportCanvas.height - drawHeight) / 2;
        } else {
          drawWidth = exportCanvas.height * aspectRatio;
          drawX = (exportCanvas.width - drawWidth) / 2;
        }
        exportCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        canvasState.texts.forEach(textElement => {
          exportCtx.save();
          exportCtx.font = `${textElement.fontSize * scale}px ${textElement.fontFamily}`;
          exportCtx.textAlign = textElement.alignment as CanvasTextAlign;
          exportCtx.fillStyle = textElement.color;
          exportCtx.globalAlpha = textElement.opacity;
          exportCtx.translate(textElement.x * scale, textElement.y * scale);
          exportCtx.rotate(textElement.rotation * Math.PI / 180);
          if (textElement.strokeWidth > 0) {
            exportCtx.strokeStyle = textElement.strokeColor;
            exportCtx.lineWidth = textElement.strokeWidth * scale;
            exportCtx.strokeText(textElement.text, 0, 0);
          }
          if (textElement.shadowBlur > 0) {
            exportCtx.shadowColor = textElement.shadowColor;
            exportCtx.shadowBlur = textElement.shadowBlur * scale;
            exportCtx.shadowOffsetX = textElement.shadowOffsetX * scale;
            exportCtx.shadowOffsetY = textElement.shadowOffsetY * scale;
          }
          exportCtx.fillText(textElement.text, 0, 0);
          exportCtx.restore();
        });
        const link = document.createElement("a");
        link.download = `soma_canvas_${Date.now()}.${format}`;
        link.href = exportCanvas.toDataURL(`image/${format}`);
        link.click();
      };
      img.src = canvasState.backgroundImage;
    }
  }, [canvasState]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = DISPLAY_WIDTH;
      canvasRef.current.height = DISPLAY_HEIGHT;
    }
  }, []);
  useEffect(() => {
    if (selectedImage) {
      setCanvasState(prev => ({ ...prev, backgroundImage: selectedImage }));
    }
  }, [selectedImage]);
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(5, 31, 34, 0.95)" }}>
      <div className="w-full max-w-7xl h-full max-h-[90vh] flex flex-col rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: "#051F22" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(0, 109, 90, 0.3)" }}>
          <h2 className="text-2xl font-semibold" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>Editor de Canvas</h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={undo} disabled={currentHistoryIndex <= 0} className="h-8 w-8 p-0" style={{ color: "#2FFFCC" }}><Undo2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={currentHistoryIndex >= history.length - 1} className="h-8 w-8 p-0" style={{ color: "#2FFFCC" }}><Redo2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0" style={{ color: "#2FFFCC" }}><X className="h-4 w-4" /></Button>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex gap-6 p-6 overflow-auto">
          {/* Left Panel - Text Controls */}
          <div className="w-80 space-y-6">
            <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>Agregar Texto</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Escribe tu texto..."
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    className="w-full p-3 border-2 rounded transition-colors"
                    style={{ backgroundColor: "rgba(5, 31, 34, 0.5)", borderColor: "#015965", color: "#F7FBFE" }}
                  />
                  <Button
                    onClick={() => {
                      if (customText.trim()) {
                        addTextToCanvas(customText.trim());
                        setCustomText("");
                      }
                    }}
                    disabled={!customText.trim()}
                    className="w-full mt-2"
                    style={{ backgroundColor: "#015965", borderColor: "#015965", color: "#F7FBFE" }}
                  >
                    <Plus className="h-4 w-4 mr-2" />Agregar Texto
                  </Button>
                </div>
                {generatedTexts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2" style={{ color: "#2FFFCC", fontFamily: "Saira, sans-serif" }}>Textos Generados</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {generatedTexts.map((text, idx) => (
                        <Button key={idx} variant="ghost" size="sm" onClick={() => addTextToCanvas(text, true)} className="w-full justify-start text-left p-2 h-auto" style={{ color: "#F7FBFE", backgroundColor: "rgba(1, 89, 101, 0.2)", borderColor: "rgba(1, 89, 101, 0.3)", border: "1px solid" }}>
                          <Type className="h-3 w-3 mr-2" />{text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Text Properties Panel */}
            {selectedTextElement && (
              <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
                <h3 className="text-lg font-medium mb-4" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>Propiedades del Texto</h3>
                <div className="space-y-4">
                  {/* Font Family */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>Fuente</label>
                    <select
                      value={selectedTextElement.fontFamily}
                      onChange={(e) => updateTextElement(selectedTextElement.id, { fontFamily: e.target.value })}
                      className="w-full p-2 rounded border-2"
                      style={{ backgroundColor: "rgba(5, 31, 34, 0.5)", borderColor: "#015965", color: "#F7FBFE" }}
                    >
                      {FONT_OPTIONS.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>Tamaño: {selectedTextElement.fontSize}px</label>
                    <Slider
                      value={[selectedTextElement.fontSize]}
                      min={12}
                      max={72}
                      step={1}
                      onValueChange={(val) => updateTextElement(selectedTextElement.id, { fontSize: val[0] })}
                      className="w-full"
                    />
                  </div>
                  {/* Color */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>Color</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SOMA_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => updateTextElement(selectedTextElement.id, { color: color.value })}
                          className={`w-8 h-8 rounded border-2 ${selectedTextElement.color === color.value ? "border-white" : "border-transparent"}`}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Alignment */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>Alineación</label>
                    <div className="flex gap-2">
                      {ALIGNMENT_OPTIONS.map(align => {
                        const Icon = align.icon;
                        return (
                          <Button
                            key={align.value}
                            variant={selectedTextElement.alignment === align.value ? "default" : "ghost"}
                            size="sm"
                            onClick={() => updateTextElement(selectedTextElement.id, { alignment: align.value as any })}
                            className="flex-1"
                            style={{ backgroundColor: selectedTextElement.alignment === align.value ? "#015965" : "transparent", color: "#F7FBFE" }}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Opacity */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>Opacidad: {Math.round(selectedTextElement.opacity * 100)}%</label>
                    <Slider
                      value={[selectedTextElement.opacity]}
                      min={0.1}
                      max={1}
                      step={0.1}
                      onValueChange={(val) => updateTextElement(selectedTextElement.id, { opacity: val[0] })}
                      className="w-full"
                    />
                  </div>
                  {/* Stroke */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>Contorno: {selectedTextElement.strokeWidth}px</label>
                    <Slider
                      value={[selectedTextElement.strokeWidth]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(val) => updateTextElement(selectedTextElement.id, { strokeWidth: val[0] })}
                      className="w-full"
                    />
                    {selectedTextElement.strokeWidth > 0 && (
                      <div className="mt-2">
                        <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>Color del Contorno</label>
                        <div className="grid grid-cols-3 gap-2">
                          {SOMA_COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => updateTextElement(selectedTextElement.id, { strokeColor: color.value })}
                              className={`w-8 h-8 rounded border-2 ${selectedTextElement.strokeColor === color.value ? "border-white" : "border-transparent"}`}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    onClick={() => deleteTextElement(selectedTextElement.id)}
                    className="w-full"
                    style={{ color: "#FF6B6B" }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />Eliminar Texto
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Center - Canvas */}
          <div className="flex-1 flex flex-col items-center">
            <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border cursor-crosshair bg-[#051F22]"
                style={{
                  borderColor: "#015965",
                  width: DISPLAY_WIDTH,
                  height: DISPLAY_HEIGHT,
                  maxWidth: "100%",
                  maxHeight: "80vh"
                }}
              />
            </div>
            {/* Canvas Controls */}
            <div className="flex items-center gap-4 mt-4">
              <Button variant="ghost" size="sm" onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }))} style={{ color: "#2FFFCC" }}><ZoomIn className="h-4 w-4" /></Button>
              <span className="text-sm" style={{ color: "#F7FBFE" }}>{Math.round(canvasState.zoom * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.5) }))} style={{ color: "#2FFFCC" }}><ZoomOut className="h-4 w-4" /></Button>
            </div>
          </div>
          {/* Right Panel - Export */}
          <div className="w-80 space-y-6">
            <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>Exportar</h3>
              <div className="space-y-3">
                <Button onClick={() => exportCanvas("png", 1080)} className="w-full" style={{ backgroundColor: "#015965", borderColor: "#015965", color: "#F7FBFE" }}>
                  <Download className="h-4 w-4 mr-2" />PNG 1080x1080
                </Button>
                <Button onClick={() => exportCanvas("png", 1200)} className="w-full" style={{ backgroundColor: "#015965", borderColor: "#015965", color: "#F7FBFE" }}>
                  <Download className="h-4 w-4 mr-2" />PNG 1200x1200
                </Button>
                <Button onClick={() => exportCanvas("jpg", 1080)} className="w-full" style={{ backgroundColor: "#015965", borderColor: "#015965", color: "#F7FBFE" }}>
                  <Download className="h-4 w-4 mr-2" />JPG 1080x1080
                </Button>
              </div>
            </div>
            {/* Canvas Info */}
            <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>Información</h3>
              <div className="space-y-2 text-sm" style={{ color: "#2FFFCC" }}>
                <div>Dimensiones: {CANVAS_WIDTH}x{CANVAS_HEIGHT}px</div>
                <div>Textos: {canvasState.texts.length}</div>
                <div>Zoom: {Math.round(canvasState.zoom * 100)}%</div>
                {selectedTextElement && <div>Texto seleccionado: {selectedTextElement.text}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 