import React from 'react';
import { Warehouse, Info, ShieldCheck, Box } from 'lucide-react';

const BayScan = ({ tags }) => {
  // Define coordinates bounds for Bays:
  // Space is 5x5 room. Let's slice:
  // Bay A: X [0.0 - 2.5], Y [0.0 - 2.5]
  // Bay B: X [2.5 - 5.0], Y [0.0 - 2.5]
  // Bay C: X [0.0 - 2.5], Y [2.5 - 5.0]
  // Bay D: X [2.5 - 5.0], Y [2.5 - 5.0]

  const bays = {
    'Bay A (Alpha)': { xMin: 0, xMax: 2.5, yMin: 0, yMax: 2.5, items: [] },
    'Bay B (Beta)': { xMin: 2.5, xMax: 5.0, yMin: 0, yMax: 2.5, items: [] },
    'Bay C (Gamma)': { xMin: 0, xMax: 2.5, yMin: 2.5, yMax: 5.0, items: [] },
    'Bay D (Delta)': { xMin: 2.5, xMax: 5.0, yMin: 2.5, yMax: 5.0, items: [] },
  };

  Object.entries(tags).forEach(([id, tag]) => {
    const pos = tag.estimated_tag_position;
    if (pos) {
      if (pos.x >= 0 && pos.x < 2.5 && pos.y >= 0 && pos.y < 2.5) {
        bays['Bay A (Alpha)'].items.push({ id, tag });
      } else if (pos.x >= 2.5 && pos.x <= 5.0 && pos.y >= 0 && pos.y < 2.5) {
        bays['Bay B (Beta)'].items.push({ id, tag });
      } else if (pos.x >= 0 && pos.x < 2.5 && pos.y >= 2.5 && pos.y <= 5.0) {
        bays['Bay C (Gamma)'].items.push({ id, tag });
      } else if (pos.x >= 2.5 && pos.x <= 5.0 && pos.y >= 2.5 && pos.y <= 5.0) {
        bays['Bay D (Delta)'].items.push({ id, tag });
      }
    }
  });

  const maxCapacity = 5; // maximum expected items per bay in mockup

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Warehouse className="text-primary w-6 h-6" /> Bay Scan Monitor
        </h2>
        <p className="text-xs text-slate-400">Inventory allocation and occupancy tracking by designated spatial sectors</p>
      </div>

      {/* Grid of Bays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(bays).map(([bayName, bay]) => {
          const occupancyPercentage = Math.min(100, (bay.items.length / maxCapacity) * 100);
          
          return (
            <div key={bayName} className="glass-panel p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-slate-200">{bayName}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                  bay.items.length === 0 
                    ? 'text-slate-500 bg-slate-500/10 border-slate-500/20' 
                    : bay.items.length > 3 
                      ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' 
                      : 'text-secondary bg-secondary/10 border-secondary/20'
                }`}>
                  {bay.items.length} / {maxCapacity} slots
                </span>
              </div>

              {/* Progress Slider Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Occupancy Density</span>
                  <span>{occupancyPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      occupancyPercentage > 80 ? 'bg-yellow-500' : 'bg-primary'
                    }`} 
                    style={{ width: `${occupancyPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Listed Transponders */}
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 min-h-[80px]">
                <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2">Detected Inventory</p>
                {bay.items.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {bay.items.map(item => (
                      <div key={item.id} className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-2 rounded text-xs font-mono font-bold text-slate-300">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                        <span>{item.id}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-650 italic text-center py-3">No inventory items in this bay</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety/Audit Panel */}
      <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-secondary/5 border-secondary/10">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/10 p-2.5 rounded-lg text-secondary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Continuous Warehouse Inventory Audit</h4>
            <p className="text-xs text-slate-400">All coordinates match sector permissions. Spatial alignment is nominal.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-semibold text-slate-400">
          <Info className="w-4 h-4 text-primary" /> Active scan frequency: 2Hz
        </div>
      </div>
    </div>
  );
};

export default BayScan;
