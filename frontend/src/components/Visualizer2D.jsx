import React, { useEffect, useRef, useState } from 'react';
import { Square, Info } from 'lucide-react';

const useThemeMode = () => {
  const [isLight, setIsLight] = useState(document.documentElement.getAttribute('data-theme') === 'light');
  
  useEffect(() => {
    const handleTheme = () => {
      setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    };
    window.addEventListener('themechange', handleTheme);
    return () => window.removeEventListener('themechange', handleTheme);
  }, []);
  
  return isLight;
};

const Visualizer2D = ({ tags, readerPos }) => {
  const canvasRef = useRef(null);
  const isLight = useThemeMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = isLight ? '#FFFFFF' : '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Padding for axes
    const pad = 40;
    const mapW = width - pad * 2;
    const mapH = height - pad * 2;

    // Room scale is 5m x 5m
    const scaleX = (x) => pad + (x / 5.0) * mapW;
    const scaleY = (y) => pad + (1 - y / 5.0) * mapH; // invert Y for canvas orientation

    // Draw Grid lines (1m intervals)
    ctx.strokeStyle = isLight ? '#E2E8F0' : '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      // vertical grid
      ctx.beginPath();
      ctx.moveTo(scaleX(i), scaleY(0));
      ctx.lineTo(scaleX(i), scaleY(5));
      ctx.stroke();

      // horizontal grid
      ctx.beginPath();
      ctx.moveTo(scaleX(0), scaleY(i));
      ctx.lineTo(scaleX(5), scaleY(i));
      ctx.stroke();

      // Grid text tags
      ctx.fillStyle = isLight ? '#64748B' : '#475569';
      ctx.font = '10px monospace';
      ctx.fillText(`${i}m`, scaleX(i) - 8, height - pad + 15);
      ctx.fillText(`${i}m`, pad - 25, scaleY(i) + 4);
    }

    // Draw room boundaries
    ctx.strokeStyle = isLight ? '#CBD5E1' : '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(pad, pad, mapW, mapH);

    // Draw Tags
    const now = Date.now() / 1000;
    Object.values(tags).forEach((tag) => {
      const pos = tag.estimated_tag_position;
      if (!pos) return;

      const tx = scaleX(pos.x);
      const ty = scaleY(pos.y);
      const isActive = (now - tag.timestamp) < 2;

      // Draw active halo/ripples
      if (isActive) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.arc(tx, ty, 15 + Math.sin(Date.now() / 100) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#10b981'; // emerald
      } else {
        ctx.fillStyle = '#3b82f6'; // blue
      }

      // Draw core tag sphere
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw tag text ID
      ctx.fillStyle = isLight ? '#0F172A' : '#f8fafc';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(tag.tag_id.replace('RFID_', ''), tx + 10, ty + 3);
    });

    // Draw Reader marker
    if (readerPos) {
      const rx = scaleX(readerPos.x);
      const ry = scaleY(readerPos.y);

      // Reader outer antenna range ripple
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rx, ry, (1.5 / 5) * mapW, 0, Math.PI * 2); // 1.5m radius representation
      ctx.stroke();

      // Inner Reader box core
      ctx.fillStyle = '#ef4444'; // red
      ctx.fillRect(rx - 6, ry - 6, 12, 12);
      
      // Reader borders
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx - 6, ry - 6, 12, 12);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('READER', rx + 10, ry + 3);
    }
  }, [tags, readerPos, isLight]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Square className="text-primary w-6 h-6" /> 2D Projection Map
        </h2>
        <p className="text-xs text-slate-400">High performance top-down 2D representation of active transponders and reader sweeps</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Visualizer */}
        <div className="lg:col-span-3 glass-panel p-6 flex justify-center items-center">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={800}
            className="w-full max-w-[calc(100vh-240px)] aspect-square bg-slate-950 rounded-lg border border-slate-800"
          />
        </div>

        {/* Legend Panel */}
        <div className="lg:col-span-1 glass-panel p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-300">Layout Legend</h3>
          
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-sm border border-slate-200"></div>
              <div>
                <p className="font-semibold text-slate-200">RFID Reader</p>
                <p className="text-[10px] text-slate-500">Active transceiver unit</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-secondary rounded-full"></div>
              <div>
                <p className="font-semibold text-slate-200">Active Tag</p>
                <p className="text-[10px] text-slate-500">Transponding within last 2s</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-primary rounded-full"></div>
              <div>
                <p className="font-semibold text-slate-200">Stale Tag</p>
                <p className="text-[10px] text-slate-500">Not seen in last 2 seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border border-red-500/30 flex items-center justify-center text-[9px] text-red-400 font-mono">
                R
              </div>
              <div>
                <p className="font-semibold text-slate-200">Reader Range Sweep</p>
                <p className="text-[10px] text-slate-500">1.5m radius coverage limits</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-800 flex items-start gap-2 text-[10px] text-slate-500">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Map automatically converts meter grid vectors into real-time canvas coordinate projections.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer2D;
