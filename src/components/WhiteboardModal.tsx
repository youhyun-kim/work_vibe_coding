import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Pencil,
  Square,
  Circle,
  Eraser,
  RotateCcw,
  Download,
  Layers,
  Sparkles,
  Move,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface WhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  speakerName: string;
}

export const WhiteboardModal: React.FC<WhiteboardModalProps> = ({
  isOpen,
  onClose,
  speakerName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6'); // blue
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'laser_preset' | 'printhead_preset'>('pencil');
  const [canvasBg, setCanvasBg] = useState<'blank' | 'wallpen_grid' | 'wallpen_e2_schematic'>('wallpen_grid');

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawBackground(ctx, canvasBg);
      }
    }
  }, [isOpen, canvasBg]);

  const drawBackground = (ctx: CanvasRenderingContext2D, bgType: string) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (bgType === 'wallpen_grid') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (bgType === 'wallpen_e2_schematic') {
      // Draw simulated Wallpen E2 Vertical Printer Outline Schematic
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      
      // Vertical Track
      ctx.strokeRect(60, 40, 30, height - 80);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Wallpen Vertical Track Rail (Y-Axis)', 100, 60);

      // Printhead Carriage Box
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(90, 180, 140, 100);
      ctx.fillStyle = '#1e3a8a';
      ctx.fillText('Printhead & Laser Assembly', 100, 200);
      ctx.fillText('Z-Distance Laser: 2.5mm', 100, 220);

      // Target Wall Surface
      ctx.strokeStyle = '#64748b';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(320, 20);
      ctx.lineTo(320, height - 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('Target Concrete / Plaster Wall', 330, 40);
    }
  };

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawBackground(ctx, canvasBg);
  };

  const addPresetStencil = (type: 'laser' | 'nozzle') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = type === 'laser' ? '#ef4444' : '#3b82f6';
    ctx.font = '14px bold sans-serif';
    if (type === 'laser') {
      ctx.fillText('🔴 Laser Offset: ΔZ = 2.5mm', 200, 150);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(190, 130, 220, 35);
    } else {
      ctx.fillText('🟦 Nozzle Pattern: 1440 DPI Clear', 200, 220);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(190, 200, 240, 35);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallpen_technical_drawing_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600/20 text-blue-400 p-2 rounded-xl border border-blue-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Wallpen 화상회의 실시간 기술 화이트보드</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  공유 중
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                유로테크 & Wallpen 본사 엔지니어 간 도면 및 노즐 보정 모형 공유
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Canvas */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Tool Bar */}
          <div className="w-full md:w-56 bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 space-y-4 overflow-y-auto">
            {/* Background Templates */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                배경 도면 템플릿
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => setCanvasBg('wallpen_grid')}
                  className={`text-xs px-3 py-2 rounded-lg border text-left font-medium transition-all ${
                    canvasBg === 'wallpen_grid'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  📐 밀리미터 모눈 그리드
                </button>
                <button
                  onClick={() => setCanvasBg('wallpen_e2_schematic')}
                  className={`text-xs px-3 py-2 rounded-lg border text-left font-medium transition-all ${
                    canvasBg === 'wallpen_e2_schematic'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  🤖 Wallpen E2 구조 도면
                </button>
              </div>
            </div>

            {/* Tools */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                그리기 도구
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTool('pencil')}
                  className={`p-2 rounded-lg border flex-1 flex items-center justify-center space-x-1 text-xs font-medium ${
                    tool === 'pencil'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <Pencil className="w-4 h-4" />
                  <span>펜</span>
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`p-2 rounded-lg border flex-1 flex items-center justify-center space-x-1 text-xs font-medium ${
                    tool === 'eraser'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                  <span>지우개</span>
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                선 색상
              </label>
              <div className="flex items-center space-x-2">
                {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#000000'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 ${
                      color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Quick Tech Stencils */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                빠른 스티커/표시
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => addPresetStencil('laser')}
                  className="w-full text-xs bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 py-1.5 px-2.5 rounded-lg text-left"
                >
                  🔴 레이저 센서 오프셋 마크
                </button>
                <button
                  onClick={() => addPresetStencil('nozzle')}
                  className="w-full text-xs bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-blue-200 py-1.5 px-2.5 rounded-lg text-left"
                >
                  🟦 노즐 테스트 그리드
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2 border-t border-slate-800">
              <button
                onClick={clearCanvas}
                className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg font-medium flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>캔버스 초기화</span>
              </button>
              <button
                onClick={downloadCanvas}
                className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>도면 PNG 저장</span>
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-slate-200 p-4 flex items-center justify-center overflow-auto relative">
            <canvas
              ref={canvasRef}
              width={720}
              height={480}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="bg-white rounded-xl shadow-xl cursor-crosshair border border-slate-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
