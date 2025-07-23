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
  RotateCw,
  Eye,
  EyeOff,
  Copy,
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

const SNAP_THRESHOLD = 10; // pixels

// Social Media Export Presets
const EXPORT_PRESETS = [
  { name: "Instagram Post", width: 1080, height: 1080, format: "png" as const },
  { name: "Instagram Story", width: 1080, height: 1920, format: "png" as const },
  { name: "Instagram Reel", width: 1080, height: 1920, format: "png" as const },
  { name: "TikTok", width: 1080, height: 1920, format: "png" as const },
  { name: "LinkedIn Post", width: 1200, height: 1200, format: "png" as const },
  { name: "LinkedIn Article", width: 1200, height: 627, format: "png" as const },
  { name: "Twitter/X Post", width: 1200, height: 675, format: "png" as const },
  { name: "Facebook Post", width: 1200, height: 630, format: "png" as const },
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
  visible: boolean;
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
  favoriteTexts: string[];
  onAddTextToCanvas?: (text: string) => void;
}

export default function CanvasEditor({
  isOpen,
  onClose,
  selectedImage,
  generatedTexts,
  favoriteTexts,
  onAddTextToCanvas,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialState = {
    texts: [],
    backgroundImage: null,
    zoom: 1,
    offset: { x: 0, y: 0 },
  };
  const [canvasState, setCanvasState] = useState<CanvasState>(initialState);
  const [history, setHistory] = useState<CanvasState[]>([initialState]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [lastSavedState, setLastSavedState] = useState<string>(JSON.stringify(initialState));
  const [selectedTextElement, setSelectedTextElement] = useState<TextElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [customText, setCustomText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [clipboardText, setClipboardText] = useState<TextElement | null>(null);
  const [snapGuides, setSnapGuides] = useState<{
    vertical: number | null;
    horizontal: number | null;
  }>({ vertical: null, horizontal: null });

  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1080;
  const DISPLAY_WIDTH = 900;
  const DISPLAY_HEIGHT = 900;

  // Calculate snap positions and show guides
  const calculateSnapPosition = useCallback((element: TextElement, newX: number, newY: number) => {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    
    let snappedX = newX;
    let snappedY = newY;
    let guides = { vertical: null as number | null, horizontal: null as number | null };
    
    // Check vertical center alignment
    if (Math.abs(newX - centerX) < SNAP_THRESHOLD) {
      snappedX = centerX;
      guides.vertical = centerX;
    }
    
    // Check horizontal center alignment
    if (Math.abs(newY - centerY) < SNAP_THRESHOLD) {
      snappedY = centerY;
      guides.horizontal = centerY;
    }
    
    // Check alignment with other text elements - ADD SAFETY CHECK
    if (canvasState && canvasState.texts && Array.isArray(canvasState.texts)) {
      canvasState.texts.forEach(text => {
        if (text.id === element.id) return;
        
        // Vertical alignment (same X position)
        if (Math.abs(newX - text.x) < SNAP_THRESHOLD) {
          snappedX = text.x;
          guides.vertical = text.x;
        }
        
        // Horizontal alignment (same Y position)
        if (Math.abs(newY - text.y) < SNAP_THRESHOLD) {
          snappedY = text.y;
          guides.horizontal = text.y;
        }
      });
    }
    
    setSnapGuides(guides);
    return { x: snappedX, y: snappedY };
  }, [canvasState?.texts]);

  // Draw snap guides
  const drawSnapGuides = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!snapGuides.vertical && !snapGuides.horizontal) return;
    
    ctx.save();
    ctx.strokeStyle = "#2FFFCC";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.8;
    
    // Draw vertical guide
    if (snapGuides.vertical !== null) {
      ctx.beginPath();
      ctx.moveTo(snapGuides.vertical, 0);
      ctx.lineTo(snapGuides.vertical, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    // Draw horizontal guide
    if (snapGuides.horizontal !== null) {
      ctx.beginPath();
      ctx.moveTo(0, snapGuides.horizontal);
      ctx.lineTo(CANVAS_WIDTH, snapGuides.horizontal);
      ctx.stroke();
    }
    
    ctx.restore();
  }, [snapGuides]);

  // Copy/Duplicate text elements
  const copyTextElement = useCallback((element: TextElement) => {
    if (!element) return;
    setClipboardText({ ...element });
  }, []);

  const duplicateTextElement = useCallback((element: TextElement) => {
    if (!element) return;
    
    const duplicatedText: TextElement = {
      ...element,
      id: Date.now(),
      x: element.x + 20, // Offset position
      y: element.y + 20,
    };
    
    setCanvasState(prevState => {
      const currentTexts = prevState?.texts || [];
      const newState = {
        ...prevState,
        texts: [...currentTexts, duplicatedText],
      };
      
      setSelectedTextElement(duplicatedText);
      return newState;
    });
  }, []);

  const pasteTextElement = useCallback(() => {
    if (!clipboardText) return;
    
    const pastedText: TextElement = {
      ...clipboardText,
      id: Date.now(),
      x: clipboardText.x + 20, // Offset position
      y: clipboardText.y + 20,
    };
    
    setCanvasState(prevState => {
      const currentTexts = prevState?.texts || [];
      const newState = {
        ...prevState,
        texts: [...currentTexts, pastedText],
      };
      
      setSelectedTextElement(pastedText);
      return newState;
    });
  }, [clipboardText]);

  // Save state to history with debouncing
  const saveToHistory = useCallback((newState: CanvasState) => {
    if (isUpdating || !newState || !Array.isArray(newState.texts)) return;
    
    const currentStateString = JSON.stringify(newState);
    
    // Only save if state actually changed
    if (currentStateString === lastSavedState) {
      return;
    }
    
    setHistory(prev => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      newHistory.push(JSON.parse(currentStateString));
      
      // Keep only last 50 states to prevent memory issues
      if (newHistory.length > 50) {
        const trimmed = newHistory.slice(-50);
        return trimmed;
      }
      
      return newHistory;
    });
    
    setCurrentHistoryIndex(prev => {
      const newIndex = prev + 1;
      return newIndex >= 50 ? 49 : newIndex;
    });
    
    setLastSavedState(currentStateString);
  }, [currentHistoryIndex, isUpdating, lastSavedState]);

  // Add text to canvas
  const addTextToCanvas = useCallback((text: string, fromGenerated = false) => {
    // Save current state before making changes
    if (canvasState) {
      saveToHistory(canvasState);
    }
    
    const newText: TextElement = {
      id: Date.now(),
      text,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      fontSize: 48,
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
      visible: true,
    };
    
    setCanvasState(prevState => {
      const currentTexts = prevState?.texts || [];
      const newState = {
        ...prevState,
        texts: [...currentTexts, newText],
      };
      
      setSelectedTextElement(newText);
      
      if (fromGenerated && onAddTextToCanvas) {
        onAddTextToCanvas(text);
      }
      
      return newState;
    });
  }, [canvasState, saveToHistory, onAddTextToCanvas]);

  // Update text element with proper state management
  const updateTextElement = useCallback((id: number, updates: Partial<TextElement>) => {
    // Save to history for significant property changes (not just position during dragging)
    const isPositionUpdate = 'x' in updates || 'y' in updates;
    const isSignificantChange = !isPositionUpdate || !isDragging;
    
    if (isSignificantChange && canvasState) {
      saveToHistory(canvasState);
    }
    
    setIsUpdating(true);
    
    setCanvasState(prevState => {
      const currentTexts = prevState?.texts || [];
      const newTexts = currentTexts.map(text =>
        text.id === id ? { ...text, ...updates } : text
      );
      return { ...prevState, texts: newTexts };
    });
    
    // Update selected element if it's the one being updated
    setSelectedTextElement(prev => 
      prev && prev.id === id ? { ...prev, ...updates } : prev
    );
    
    // Reset updating flag after a short delay
    setTimeout(() => setIsUpdating(false), 100);
  }, [canvasState, saveToHistory, isDragging]);

  // Delete text element
  const deleteTextElement = useCallback((id: number) => {
    // Save current state before making changes
    if (canvasState) {
      saveToHistory(canvasState);
    }
    
    setCanvasState(prevState => {
      const currentTexts = prevState?.texts || [];
      const newTexts = currentTexts.filter(text => text.id !== id);
      const newState = { ...prevState, texts: newTexts };
      
      setSelectedTextElement(null);
      
      return newState;
    });
  }, [canvasState, saveToHistory]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const previousState = history[newIndex];
      if (previousState && Array.isArray(previousState.texts)) {
        setIsUpdating(true); // Prevent saving to history during undo
        setCurrentHistoryIndex(newIndex);
        setCanvasState(previousState);
        setSelectedTextElement(null);
        setLastSavedState(JSON.stringify(previousState)); // Update last saved state
        setTimeout(() => setIsUpdating(false), 100);
      }
    }
  }, [currentHistoryIndex, history]);

  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const nextState = history[newIndex];
      if (nextState && Array.isArray(nextState.texts)) {
        setIsUpdating(true); // Prevent saving to history during redo
        setCurrentHistoryIndex(newIndex);
        setCanvasState(nextState);
        setSelectedTextElement(null);
        setLastSavedState(JSON.stringify(nextState)); // Update last saved state
        setTimeout(() => setIsUpdating(false), 100);
      }
    }
  }, [currentHistoryIndex, history]);

  // Get text bounds for better click detection
  const getTextBounds = useCallback((textElement: TextElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    ctx.save();
    ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
    const metrics = ctx.measureText(textElement.text);
    
    // Get actual text dimensions
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const textWidth = metrics.width;
    const textHeight = actualHeight || textElement.fontSize;
    
    // Calculate position based on alignment
    let x = textElement.x;
    if (textElement.alignment === "center") {
      x = textElement.x - textWidth / 2;
    } else if (textElement.alignment === "right") {
      x = textElement.x - textWidth;
    }
    
    // Account for rotation
    const centerX = textElement.x;
    const centerY = textElement.y;
    const cos = Math.cos(textElement.rotation * Math.PI / 180);
    const sin = Math.sin(textElement.rotation * Math.PI / 180);
    
    ctx.restore();
    
    return {
      x: x - 10, // Add padding
      y: textElement.y - textHeight - 10,
      width: textWidth + 20,
      height: textHeight + 20,
      centerX,
      centerY,
      cos,
      sin
    };
  }, []);

  // Draw text elements with better rendering
  const drawTexts = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const texts = canvasState?.texts || [];
    texts.forEach(textElement => {
      if (!textElement.visible) return;
      
      ctx.save();
      ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
      ctx.textAlign = textElement.alignment as CanvasTextAlign;
      ctx.fillStyle = textElement.color;
      ctx.globalAlpha = textElement.opacity;
      
      // Apply transformations
      ctx.translate(textElement.x, textElement.y);
      ctx.rotate(textElement.rotation * Math.PI / 180);
      
      // Draw shadow if enabled
      if (textElement.shadowBlur > 0) {
        ctx.shadowColor = textElement.shadowColor;
        ctx.shadowBlur = textElement.shadowBlur;
        ctx.shadowOffsetX = textElement.shadowOffsetX;
        ctx.shadowOffsetY = textElement.shadowOffsetY;
      }
      
      // Draw stroke if enabled
      if (textElement.strokeWidth > 0) {
        ctx.strokeStyle = textElement.strokeColor;
        ctx.lineWidth = textElement.strokeWidth;
        ctx.strokeText(textElement.text, 0, 0);
      }
      
      // Draw text
      ctx.fillText(textElement.text, 0, 0);
      
      // Draw selection indicator
      if (selectedTextElement && selectedTextElement.id === textElement.id) {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = "#2FFFCC";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const metrics = ctx.measureText(textElement.text);
        const textWidth = metrics.width;
        const textHeight = textElement.fontSize;
        
        let rectX = -textWidth / 2;
        if (textElement.alignment === "left") rectX = 0;
        else if (textElement.alignment === "right") rectX = -textWidth;
        
        ctx.strokeRect(rectX - 5, -textHeight - 5, textWidth + 10, textHeight + 10);
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });
  }, [canvasState?.texts, selectedTextElement]);

  // Canvas drawing with better image handling
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasState) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and offset
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(canvasState.zoom, canvasState.zoom);
    ctx.translate(-canvas.width / 2 + canvasState.offset.x, -canvas.height / 2 + canvasState.offset.y);
    
    // Draw background image
    if (canvasState?.backgroundImage) {
      const img = new Image();
      // Don't set CORS for any images to avoid blocking
      // External URLs from OpenAI don't support CORS anyway
      // Data URLs don't need CORS
      img.onload = () => {
        console.log('Image loaded successfully');
        console.log('Image dimensions:', img.width, 'x', img.height);
        try {
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
          drawSnapGuides(ctx);
        } catch (error) {
          console.error('Error drawing image to canvas:', error);
          // Fallback
          ctx.fillStyle = "#051F22";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          drawTexts();
          drawSnapGuides(ctx);
        }
      };
      img.onerror = (event) => {
        console.error('Failed to load background image:', event);
        console.log('Image source preview:', canvasState.backgroundImage?.substring(0, 100) + '...');
        
        // Draw background color instead
        ctx.fillStyle = "#051F22";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawTexts();
        drawSnapGuides(ctx);
      };
      
      try {
        img.src = canvasState.backgroundImage;
      } catch (error) {
        console.error('Error setting image source:', error);
        // Fallback
        ctx.fillStyle = "#051F22";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawTexts();
        drawSnapGuides(ctx);
      }
    } else {
      // Draw background color
      ctx.fillStyle = "#051F22";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawTexts();
      drawSnapGuides(ctx);
    }
    
    ctx.restore();
  }, [canvasState, drawTexts]);

  // Enhanced mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;
    
    // Find clicked text element
    const texts = canvasState?.texts || [];
    const clickedText = texts.find(text => {
      const bounds = getTextBounds(text);
      if (!bounds) return false;
      
      return x >= bounds.x && x <= bounds.x + bounds.width && 
             y >= bounds.y && y <= bounds.y + bounds.height;
    });
    
    if (clickedText) {
      setSelectedTextElement(clickedText);
      setIsDragging(true);
      setDragStart({ x: x - clickedText.x, y: y - clickedText.y });
    } else {
      setSelectedTextElement(null);
    }
  }, [canvasState?.texts, getTextBounds]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedTextElement) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;
    
    const targetX = x - dragStart.x;
    const targetY = y - dragStart.y;
    
    // Calculate snap position
    const snappedPosition = calculateSnapPosition(selectedTextElement, targetX, targetY);
    
    updateTextElement(selectedTextElement.id, {
      x: snappedPosition.x,
      y: snappedPosition.y,
    });
  }, [isDragging, selectedTextElement, dragStart, updateTextElement, calculateSnapPosition]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setSnapGuides({ vertical: null, horizontal: null });
      // Save state after dragging completes
      setTimeout(() => {
        if (!isUpdating && canvasState) {
          saveToHistory(canvasState);
        }
      }, 100);
    }
  }, [isDragging, saveToHistory, canvasState, isUpdating]);

  // Add these functions
  const resetCanvas = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      zoom: 1,
      offset: { x: 0, y: 0 }
    }));
  }, []);

  const fitToScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const containerWidth = DISPLAY_WIDTH;
    const containerHeight = DISPLAY_HEIGHT;
    const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    const containerRatio = containerWidth / containerHeight;
    
    let newZoom = 1;
    if (canvasRatio > containerRatio) {
      newZoom = containerWidth / CANVAS_WIDTH;
    } else {
      newZoom = containerHeight / CANVAS_HEIGHT;
    }
    
    setCanvasState(prev => ({
      ...prev,
      zoom: newZoom * 0.9, // 90% to add some padding
      offset: { x: 0, y: 0 }
    }));
  }, []);

  // Export canvas with better quality
  const exportCanvas = useCallback((format: "png" | "jpg", width: number = 1080, height: number = 1080, presetName?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;
    
    const scaleX = width / CANVAS_WIDTH;
    const scaleY = height / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY); // Use the smaller scale to maintain aspect ratio
    
    // Enable better image quality
    exportCtx.imageSmoothingEnabled = true;
    exportCtx.imageSmoothingQuality = "high";
    
    if (canvasState?.backgroundImage) {
      const img = new Image();
      // Don't set CORS for any images - OpenAI URLs don't support it
      // This means exports with external URLs will be tainted, but at least they'll work
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
        
        // Draw texts
        const texts = canvasState?.texts || [];
        texts.forEach(textElement => {
          if (!textElement.visible) return;
          
          exportCtx.save();
          exportCtx.font = `${textElement.fontSize * scale}px ${textElement.fontFamily}`;
          exportCtx.textAlign = textElement.alignment as CanvasTextAlign;
          exportCtx.fillStyle = textElement.color;
          exportCtx.globalAlpha = textElement.opacity;
          
          exportCtx.translate(textElement.x * scale, textElement.y * scale);
          exportCtx.rotate(textElement.rotation * Math.PI / 180);
          
          if (textElement.shadowBlur > 0) {
            exportCtx.shadowColor = textElement.shadowColor;
            exportCtx.shadowBlur = textElement.shadowBlur * scale;
            exportCtx.shadowOffsetX = textElement.shadowOffsetX * scale;
            exportCtx.shadowOffsetY = textElement.shadowOffsetY * scale;
          }
          
          if (textElement.strokeWidth > 0) {
            exportCtx.strokeStyle = textElement.strokeColor;
            exportCtx.lineWidth = textElement.strokeWidth * scale;
            exportCtx.strokeText(textElement.text, 0, 0);
          }
          
          exportCtx.fillText(textElement.text, 0, 0);
          exportCtx.restore();
        });
        
        // Download
        try {
          const link = document.createElement("a");
          const filename = presetName 
            ? `soma_${presetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.${format}`
            : `soma_canvas_${width}x${height}_${Date.now()}.${format}`;
          link.download = filename;
          link.href = exportCanvas.toDataURL(`image/${format}`, format === "jpg" ? 0.95 : 1.0);
          link.click();
        } catch (error) {
          console.error('Cannot export canvas:', error);
          alert('⚠️ Error al exportar la imagen. La imagen puede contener elementos externos que no se pueden exportar.');
        }
      };
      img.onerror = (error) => {
        console.error('Failed to load background image for export:', error);
        console.log('Image source:', canvasState.backgroundImage);
        // Export without background image
        exportCtx.fillStyle = "#051F22";
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        const texts = canvasState?.texts || [];
        texts.forEach(textElement => {
          if (!textElement.visible) return;
          
          exportCtx.save();
          exportCtx.font = `${textElement.fontSize * scale}px ${textElement.fontFamily}`;
          exportCtx.textAlign = textElement.alignment as CanvasTextAlign;
          exportCtx.fillStyle = textElement.color;
          exportCtx.globalAlpha = textElement.opacity;
          
          exportCtx.translate(textElement.x * scale, textElement.y * scale);
          exportCtx.rotate(textElement.rotation * Math.PI / 180);
          
          if (textElement.shadowBlur > 0) {
            exportCtx.shadowColor = textElement.shadowColor;
            exportCtx.shadowBlur = textElement.shadowBlur * scale;
            exportCtx.shadowOffsetX = textElement.shadowOffsetX * scale;
            exportCtx.shadowOffsetY = textElement.shadowOffsetY * scale;
          }
          
          if (textElement.strokeWidth > 0) {
            exportCtx.strokeStyle = textElement.strokeColor;
            exportCtx.lineWidth = textElement.strokeWidth * scale;
            exportCtx.strokeText(textElement.text, 0, 0);
          }
          
          exportCtx.fillText(textElement.text, 0, 0);
          exportCtx.restore();
        });
        
        try {
          const link = document.createElement("a");
          link.download = `soma_canvas_${Date.now()}.${format}`;
          link.href = exportCanvas.toDataURL(`image/${format}`, format === "jpg" ? 0.95 : 1.0);
          link.click();
        } catch (error) {
          console.error('Cannot export canvas due to CORS restrictions:', error);
          alert('⚠️ No se puede exportar la imagen debido a restricciones de seguridad.');
        }
      };
      img.src = canvasState.backgroundImage;
    } else {
      // Export without background image
      exportCtx.fillStyle = "#051F22";
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      const texts = canvasState?.texts || [];
      texts.forEach(textElement => {
        if (!textElement.visible) return;
        
        exportCtx.save();
        exportCtx.font = `${textElement.fontSize * scale}px ${textElement.fontFamily}`;
        exportCtx.textAlign = textElement.alignment as CanvasTextAlign;
        exportCtx.fillStyle = textElement.color;
        exportCtx.globalAlpha = textElement.opacity;
        
        exportCtx.translate(textElement.x * scale, textElement.y * scale);
        exportCtx.rotate(textElement.rotation * Math.PI / 180);
        
        if (textElement.shadowBlur > 0) {
          exportCtx.shadowColor = textElement.shadowColor;
          exportCtx.shadowBlur = textElement.shadowBlur * scale;
          exportCtx.shadowOffsetX = textElement.shadowOffsetX * scale;
          exportCtx.shadowOffsetY = textElement.shadowOffsetY * scale;
        }
        
        if (textElement.strokeWidth > 0) {
          exportCtx.strokeStyle = textElement.strokeColor;
          exportCtx.lineWidth = textElement.strokeWidth * scale;
          exportCtx.strokeText(textElement.text, 0, 0);
        }
        
        exportCtx.fillText(textElement.text, 0, 0);
        exportCtx.restore();
      });
      
              try {
          const link = document.createElement("a");
          const filename = presetName 
            ? `soma_${presetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.${format}`
            : `soma_canvas_${width}x${height}_${Date.now()}.${format}`;
          link.download = filename;
          link.href = exportCanvas.toDataURL(`image/${format}`, format === "jpg" ? 0.95 : 1.0);
          link.click();
        } catch (error) {
          console.error('Cannot export canvas:', error);
          alert('⚠️ Error al exportar la imagen.');
        }
    }
  }, [canvasState]);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = DISPLAY_WIDTH;
      canvasRef.current.height = DISPLAY_HEIGHT;
    }
  }, []);



  // Convert external URLs to data URLs to avoid tainted canvas
  const convertToDataURL = useCallback(async (imageUrl: string): Promise<string> => {
    if (imageUrl.startsWith('data:')) {
      // Already a data URL
      return imageUrl;
    }

    try {
      // Use server-side conversion to bypass CORS
      const response = await fetch('/api/convert-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Server error: ${response.status}`);
      }

      const { dataUrl } = await response.json();
      return dataUrl;
    } catch (error) {
      console.error('Failed to convert image to data URL:', error);
      throw error;
    }
  }, []);

  // Update background image
  useEffect(() => {
    if (selectedImage) {
      // Validate the image source
      if (typeof selectedImage === 'string' && selectedImage.length > 0) {
        if (selectedImage.startsWith('data:image/') || selectedImage.startsWith('http')) {
          // Convert external URLs to data URLs to avoid tainted canvas
          if (selectedImage.startsWith('http')) {
            setIsLoadingImage(true);
            convertToDataURL(selectedImage)
              .then(dataUrl => {
                setCanvasState(prev => ({ ...prev, backgroundImage: dataUrl }));
                setIsLoadingImage(false);
              })
              .catch(error => {
                console.error('Failed to load external image:', error);
                // Fallback: use original URL (will work for display but not export)
                setCanvasState(prev => ({ ...prev, backgroundImage: selectedImage }));
                setIsLoadingImage(false);
              });
          } else {
            // Data URL - use directly
            setCanvasState(prev => ({ ...prev, backgroundImage: selectedImage }));
          }
        } else {
          console.error('Invalid image source format:', selectedImage.substring(0, 100));
        }
      } else {
        console.error('Invalid image source provided:', selectedImage);
      }
    }
  }, [selectedImage, convertToDataURL]);

  // Redraw canvas when state changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Save to history when canvas state changes (debounced)
  useEffect(() => {
    // Only save to history on significant changes, not during dragging
    if (!isDragging && !isUpdating && canvasState) {
      const timeoutId = setTimeout(() => {
        const currentStateString = JSON.stringify(canvasState);
        if (currentStateString !== lastSavedState) {
          if (isUpdating || !canvasState || !Array.isArray(canvasState.texts)) return;
          
          setHistory(prev => {
            const newHistory = prev.slice(0, currentHistoryIndex + 1);
            newHistory.push(JSON.parse(currentStateString));
            
            // Keep only last 50 states to prevent memory issues
            if (newHistory.length > 50) {
              const trimmed = newHistory.slice(-50);
              return trimmed;
            }
            
            return newHistory;
          });
          
          setCurrentHistoryIndex(prev => {
            const newIndex = prev + 1;
            return newIndex >= 50 ? 49 : newIndex;
          });
          
          setLastSavedState(currentStateString);
        }
      }, 300); // Reduced delay for better responsiveness
      
      return () => clearTimeout(timeoutId);
    }
  }, [canvasState, isDragging, isUpdating, lastSavedState, currentHistoryIndex]);



  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't trigger when typing
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'd':
            e.preventDefault();
            if (selectedTextElement) {
              duplicateTextElement(selectedTextElement);
            }
            break;
          case 'c':
            e.preventDefault();
            if (selectedTextElement) {
              copyTextElement(selectedTextElement);
            }
            break;
          case 'v':
            e.preventDefault();
            pasteTextElement();
            break;
          case 'a':
            e.preventDefault();
            // Select all text elements (future implementation)
            break;
        }
      }
      
      // Delete selected element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTextElement) {
          e.preventDefault();
          deleteTextElement(selectedTextElement.id);
        }
      }
      
      // Arrow keys for fine positioning
      if (selectedTextElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const updates: Partial<TextElement> = {};
        
        switch (e.key) {
          case 'ArrowUp': updates.y = selectedTextElement.y - step; break;
          case 'ArrowDown': updates.y = selectedTextElement.y + step; break;
          case 'ArrowLeft': updates.x = selectedTextElement.x - step; break;
          case 'ArrowRight': updates.x = selectedTextElement.x + step; break;
        }
        
        updateTextElement(selectedTextElement.id, updates);
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, selectedTextElement, undo, redo, deleteTextElement, updateTextElement, duplicateTextElement, copyTextElement, pasteTextElement]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(5, 31, 34, 0.95)" }}>
      <div className="w-full max-w-7xl h-full max-h-[90vh] flex flex-col rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: "#051F22" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(0, 109, 90, 0.3)" }}>
          <h2 className="text-2xl font-semibold" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>
            Editor de Canvas
          </h2>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={undo} 
              disabled={currentHistoryIndex <= 0} 
              className="h-8 w-8 p-0" 
              style={{ color: "#2FFFCC" }}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={redo} 
              disabled={currentHistoryIndex >= history.length - 1} 
              className="h-8 w-8 p-0" 
              style={{ color: "#2FFFCC" }}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="h-8 w-8 p-0" 
              style={{ color: "#2FFFCC" }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 p-6 overflow-auto">
          {/* Left Panel - Text Controls */}
          <div className="w-80 space-y-6">
            {/* Add Text Section */}
            <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>
                Agregar Texto
              </h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Escribe tu texto..."
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter' && customText.trim()) {
                        addTextToCanvas(customText.trim());
                        setCustomText("");
                      }
                    }}
                    className="w-full p-3 border-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Texto
                  </Button>
                </div>
                
                {generatedTexts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2" style={{ color: "#2FFFCC", fontFamily: "Saira, sans-serif" }}>
                      Textos Generados
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {generatedTexts.map((text, idx) => (
                        <Button 
                          key={idx} 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => addTextToCanvas(text, true)} 
                          className="w-full justify-start text-left p-2 h-auto hover:bg-opacity-30" 
                          style={{ 
                            color: "#F7FBFE", 
                            backgroundColor: "rgba(1, 89, 101, 0.2)", 
                            borderColor: "rgba(1, 89, 101, 0.3)", 
                            border: "1px solid" 
                          }}
                        >
                          <Type className="h-3 w-3 mr-2" />
                          {text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Favorite Texts Section - Always Show */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: "#FFD700", fontFamily: "Saira, sans-serif" }}>
                    <span>★</span>
                    Textos Favoritos ({favoriteTexts.length})
                  </h4>
                  {favoriteTexts.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {favoriteTexts.map((text, idx) => (
                        <Button 
                          key={`fav-${idx}`} 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => addTextToCanvas(text, true)} 
                          className="w-full justify-start text-left p-2 h-auto hover:bg-opacity-30" 
                          style={{ 
                            color: "#F7FBFE", 
                            backgroundColor: "rgba(255, 215, 0, 0.1)", 
                            borderColor: "rgba(255, 215, 0, 0.3)", 
                            border: "1px solid" 
                          }}
                        >
                          <Type className="h-3 w-3 mr-2" />
                          {text}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs p-3 rounded border" style={{ 
                      color: "rgba(255, 215, 0, 0.7)", 
                      backgroundColor: "rgba(255, 215, 0, 0.05)",
                      borderColor: "rgba(255, 215, 0, 0.2)"
                    }}>
                      Agrega textos a favoritos desde la página principal para acceder a ellos aquí
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Text Properties Panel */}
            {selectedTextElement && (
              <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>
                    Propiedades del Texto
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateTextElement(selectedTextElement.id, { visible: !selectedTextElement.visible })}
                    className="h-8 w-8 p-0"
                    style={{ color: selectedTextElement.visible ? "#2FFFCC" : "#666" }}
                  >
                    {selectedTextElement.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Text Content */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>Texto</label>
                    <input
                      type="text"
                      value={selectedTextElement.text}
                      onChange={(e) => updateTextElement(selectedTextElement.id, { text: e.target.value })}
                      className="w-full p-2 rounded border-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: "rgba(5, 31, 34, 0.5)", borderColor: "#015965", color: "#F7FBFE" }}
                    />
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>Fuente</label>
                    <select
                      value={selectedTextElement.fontFamily}
                      onChange={(e) => updateTextElement(selectedTextElement.id, { fontFamily: e.target.value })}
                      className="w-full p-2 rounded border-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: "rgba(5, 31, 34, 0.5)", borderColor: "#015965", color: "#F7FBFE" }}
                    >
                      {FONT_OPTIONS.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>
                      Tamaño: {selectedTextElement.fontSize}px
                    </label>
                    <Slider
                      value={[selectedTextElement.fontSize]}
                      min={12}
                      max={120}
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
                          className={`w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110 ${
                            selectedTextElement.color === color.value ? "border-white scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
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
                            style={{ 
                              backgroundColor: selectedTextElement.alignment === align.value ? "#015965" : "transparent", 
                              color: "#F7FBFE" 
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rotation */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>
                      Rotación: {selectedTextElement.rotation}°
                    </label>
                    <Slider
                      value={[selectedTextElement.rotation]}
                      min={-180}
                      max={180}
                      step={1}
                      onValueChange={(val) => updateTextElement(selectedTextElement.id, { rotation: val[0] })}
                      className="w-full"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateTextElement(selectedTextElement.id, { rotation: selectedTextElement.rotation - 90 })}
                        className="flex-1"
                        style={{ color: "#2FFFCC" }}
                      >
                        <RotateCw className="h-4 w-4 mr-1" />
                        -90°
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateTextElement(selectedTextElement.id, { rotation: 0 })}
                        className="flex-1"
                        style={{ color: "#2FFFCC" }}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateTextElement(selectedTextElement.id, { rotation: selectedTextElement.rotation + 90 })}
                        className="flex-1"
                        style={{ color: "#2FFFCC" }}
                      >
                        <RotateCw className="h-4 w-4 mr-1" />
                        +90°
                      </Button>
                    </div>
                  </div>

                  {/* Opacity */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>
                      Opacidad: {Math.round(selectedTextElement.opacity * 100)}%
                    </label>
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
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>
                      Contorno: {selectedTextElement.strokeWidth}px
                    </label>
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
                              className={`w-8 h-8 rounded border-2 ${
                                selectedTextElement.strokeColor === color.value ? "border-white" : "border-transparent"
                              }`}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shadow */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#2FFFCC" }}>
                      Sombra: {selectedTextElement.shadowBlur}px
                    </label>
                    <Slider
                      value={[selectedTextElement.shadowBlur]}
                      min={0}
                      max={20}
                      step={1}
                      onValueChange={(val) => updateTextElement(selectedTextElement.id, { shadowBlur: val[0] })}
                      className="w-full"
                    />
                    {selectedTextElement.shadowBlur > 0 && (
                      <div className="space-y-2 mt-2">
                        <div>
                          <label className="block text-sm mb-1" style={{ color: "#2FFFCC" }}>Color de Sombra</label>
                          <div className="grid grid-cols-3 gap-2">
                            {SOMA_COLORS.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => updateTextElement(selectedTextElement.id, { shadowColor: color.value })}
                                className={`w-8 h-8 rounded border-2 ${
                                  selectedTextElement.shadowColor === color.value ? "border-white" : "border-transparent"
                                }`}
                                style={{ backgroundColor: color.value }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "#2FFFCC" }}>Offset X</label>
                            <Slider
                              value={[selectedTextElement.shadowOffsetX]}
                              min={-10}
                              max={10}
                              step={1}
                              onValueChange={(val) => updateTextElement(selectedTextElement.id, { shadowOffsetX: val[0] })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1" style={{ color: "#2FFFCC" }}>Offset Y</label>
                            <Slider
                              value={[selectedTextElement.shadowOffsetY]}
                              min={-10}
                              max={10}
                              step={1}
                              onValueChange={(val) => updateTextElement(selectedTextElement.id, { shadowOffsetY: val[0] })}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy/Duplicate/Delete Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => copyTextElement(selectedTextElement)}
                      className="flex-1"
                      style={{ color: "#2FFFCC" }}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => duplicateTextElement(selectedTextElement)}
                      className="flex-1"
                      style={{ color: "#2FFFCC" }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Duplicar
                    </Button>
                  </div>
                  
                  {clipboardText && (
                    <Button
                      variant="ghost"
                      onClick={pasteTextElement}
                      className="w-full"
                      style={{ color: "#2FFFCC" }}
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Pegar Texto
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={() => deleteTextElement(selectedTextElement.id)}
                    className="w-full"
                    style={{ color: "#FF6B6B" }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Texto
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 flex flex-col items-center">
            <div className="border rounded-lg p-4 relative" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
              {isLoadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-opacity-30" style={{ 
                      borderColor: '#2FFFCC',
                      borderTopColor: 'transparent'
                    }}></div>
                    <span className="text-sm" style={{ color: '#2FFFCC' }}>Procesando imagen...</span>
                  </div>
                </div>
              )}
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }))} 
                style={{ color: "#2FFFCC" }}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm" style={{ color: "#F7FBFE" }}>
                {Math.round(canvasState.zoom * 100)}%
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.5) }))} 
                style={{ color: "#2FFFCC" }}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetCanvas}
                style={{ color: "#2FFFCC" }}
              >
                Reset
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fitToScreen}
                style={{ color: "#2FFFCC" }}
              >
                Fit
              </Button>
            </div>
          </div>

          {/* Right Panel - Export */}
          <div className="w-80 space-y-6">
            {/* Text Layers Panel */}
            <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>
                Capas de Texto
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(canvasState?.texts || []).map((text, index) => (
                  <div
                    key={text.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedTextElement?.id === text.id ? 'bg-blue-500 bg-opacity-20' : 'hover:bg-gray-500 hover:bg-opacity-10'
                    }`}
                    onClick={() => setSelectedTextElement(text)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTextElement(text.id, { visible: !text.visible });
                      }}
                      className="h-6 w-6 p-0"
                      style={{ color: text.visible ? "#2FFFCC" : "#666" }}
                    >
                      {text.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: "#F7FBFE" }}>
                        {text.text || "Texto vacío"}
                      </div>
                      <div className="text-xs opacity-60" style={{ color: "#2FFFCC" }}>
                        {text.fontSize}px • {text.fontFamily.split(',')[0]}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTextElement(text.id);
                      }}
                      className="h-6 w-6 p-0"
                      style={{ color: "#FF6B6B" }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>
                Exportar para Redes Sociales
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {EXPORT_PRESETS.map((preset) => (
                  <Button 
                    key={preset.name}
                    onClick={() => exportCanvas(preset.format, preset.width, preset.height, preset.name)} 
                    className="w-full justify-start text-left" 
                    variant="ghost"
                    style={{ backgroundColor: "rgba(1, 89, 101, 0.2)", borderColor: "rgba(1, 89, 101, 0.3)", color: "#F7FBFE", border: "1px solid" }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{preset.name}</span>
                      <span className="text-xs opacity-70">{preset.width}x{preset.height} {preset.format.toUpperCase()}</span>
                    </div>
                  </Button>
                ))}
              </div>
              
              {/* Custom Size Export */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(0, 109, 90, 0.3)" }}>
                <h4 className="text-sm font-medium mb-2" style={{ color: "#2FFFCC" }}>
                  Tamaño Personalizado
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => exportCanvas("png", 1080, 1080)} 
                    className="w-full" 
                    variant="ghost"
                    style={{ backgroundColor: "rgba(1, 89, 101, 0.1)", borderColor: "rgba(1, 89, 101, 0.3)", color: "#2FFFCC", border: "1px solid" }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PNG
                  </Button>
                  <Button 
                    onClick={() => exportCanvas("jpg", 1080, 1080)} 
                    className="w-full" 
                    variant="ghost"
                    style={{ backgroundColor: "rgba(1, 89, 101, 0.1)", borderColor: "rgba(1, 89, 101, 0.3)", color: "#2FFFCC", border: "1px solid" }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    JPG
                  </Button>
                </div>
              </div>
            </div>

            {/* Canvas Info & Shortcuts */}
            <div className="border rounded-lg p-4" style={{ backgroundColor: "rgba(0, 109, 90, 0.1)", borderColor: "rgba(0, 109, 90, 0.3)" }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: "#F7FBFE", fontFamily: "Saira, sans-serif" }}>
                Información
              </h3>
              <div className="space-y-2 text-sm" style={{ color: "#2FFFCC" }}>
                <div>Dimensiones: {CANVAS_WIDTH}x{CANVAS_HEIGHT}px</div>
                <div>Textos: {(canvasState?.texts || []).length}</div>
                <div>Textos visibles: {(canvasState?.texts || []).filter(t => t.visible).length}</div>
                <div>Zoom: {Math.round((canvasState?.zoom || 1) * 100)}%</div>
                {clipboardText && (
                  <div className="text-xs" style={{ color: "#D4C4FC" }}>
                    📋 Texto copiado disponible
                  </div>
                )}
                {selectedTextElement && (
                  <div className="pt-2 border-t" style={{ borderColor: "rgba(0, 109, 90, 0.3)" }}>
                    <div>Texto seleccionado: {selectedTextElement.text}</div>
                    <div>Posición: ({Math.round(selectedTextElement.x)}, {Math.round(selectedTextElement.y)})</div>
                    <div>Rotación: {selectedTextElement.rotation}°</div>
                    <div>Visible: {selectedTextElement.visible ? "Sí" : "No"}</div>
                  </div>
                )}
              </div>
              
              {/* Keyboard Shortcuts */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(0, 109, 90, 0.3)" }}>
                <h4 className="text-sm font-medium mb-2" style={{ color: "#F7FBFE" }}>
                  Atajos de Teclado
                </h4>
                <div className="space-y-1 text-xs" style={{ color: "#2FFFCC" }}>
                  <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Z</kbd> Deshacer</div>
                  <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Y</kbd> Rehacer</div>
                  <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+C</kbd> Copiar texto</div>
                  <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+V</kbd> Pegar texto</div>
                  <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+D</kbd> Duplicar texto</div>
                  <div><kbd className="bg-gray-700 px-1 rounded">Del</kbd> Eliminar texto</div>
                  <div><kbd className="bg-gray-700 px-1 rounded">↑↓←→</kbd> Mover texto</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 