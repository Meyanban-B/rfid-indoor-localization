import React, { useState } from 'react';
import { MapPin, Navigation, ArrowRight, Radio } from 'lucide-react';
import { calculateRelativeMetrics } from '../utils/metrics';

const RFIDTracker = ({ tags, readerPos }) => {
  const [showRelativeMetrics, setShowRelativeMetrics] = useState(false);
  const activeTags = Object.values(tags);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <MapPin className="text-primary w-6 h-6" /> Live RFID Tracker
        </h2>
        <p className="text-xs text-slate-400">Track dynamic positions of reader units and passive transponders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reader Coordinates Card */}
        <div className="glass-panel p-6 border-l-4 border-red-500 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reader Location</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">Active Orbits</h3>
            </div>
            <div className="bg-red-500/10 p-2 rounded-lg text-red-500 border border-red-500/20">
              <Navigation className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>X Coordinate:</span>
              <span className="text-slate-100 font-semibold">{readerPos ? readerPos.x.toFixed(3) : 'N/A'} m</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Y Coordinate:</span>
              <span className="text-slate-100 font-semibold">{readerPos ? readerPos.y.toFixed(3) : 'N/A'} m</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Z (Height):</span>
              <span className="text-slate-100 font-semibold">{readerPos ? readerPos.z.toFixed(3) : 'N/A'} m</span>
            </div>
          </div>
        </div>

        {/* Live System Specs */}
        <div className="glass-panel p-6 border-l-4 border-primary flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Telemetry Speed</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">500 ms Stream</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-lg text-primary border border-primary/20">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Sync Protocol:</span>
              <span className="text-slate-100 font-mono text-xs font-semibold">WebSockets / JSON</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Broker Topic:</span>
              <span className="text-slate-100 font-mono text-[10px] font-semibold">rfid_localization_alpha_team_e22d</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Active Transponders:</span>
              <span className="text-slate-100 font-semibold">{activeTags.length}</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="glass-panel p-6 border-l-4 border-secondary flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Solver Status</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">POLAR Solver</h3>
            </div>
            <div className="bg-secondary/10 p-2 rounded-lg text-secondary border border-secondary/20 font-bold text-xs">
              OK
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Error Deviation:</span>
              <span className="text-secondary font-mono text-xs font-semibold">± 0.12 m</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Frequency Lock:</span>
              <span className="text-slate-100 font-semibold">915.0 MHz</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Simulation Mode:</span>
              <span className="text-slate-100 font-semibold">Synthetic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid List of Tag Coordinates */}
      <div className="glass-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-800/20 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-300">Active Tags Coordinates Map</h3>
          
          {/* Relative metrics toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRelativeMetrics}
              onChange={(e) => setShowRelativeMetrics(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
            />
            <span className="text-xs text-slate-400 font-medium hover:text-slate-200 transition-colors">Show Distance/Bearing</span>
          </label>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTags.map((tag) => {
            const metrics = calculateRelativeMetrics(tag.estimated_tag_position, readerPos);

            return (
              <div key={tag.tag_id} className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-3 hover:border-primary/30 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary font-mono">{tag.tag_id}</span>
                    {metrics && (
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase" title={`Relative Bearing: ${metrics.angle.toFixed(0)}°`}>
                        {metrics.direction}
                      </span>
                    )}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                </div>
                
                {tag.estimated_tag_position ? (
                  <div className="space-y-2 pt-2 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">X-POS</span>
                      <span className="text-xs font-mono font-semibold text-slate-200">{tag.estimated_tag_position.x.toFixed(3)} m</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">Y-POS</span>
                      <span className="text-xs font-mono font-semibold text-slate-200">{tag.estimated_tag_position.y.toFixed(3)} m</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">Z-POS</span>
                      <span className="text-xs font-mono font-semibold text-slate-200">{tag.estimated_tag_position.z.toFixed(3)} m</span>
                    </div>
                    {showRelativeMetrics && (
                      <div className="pt-2 border-t border-slate-800/30 space-y-2">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-[10px] text-secondary font-mono">DISTANCE</span>
                          <span className="text-xs font-mono font-bold text-secondary">
                            {metrics ? `${metrics.distance.toFixed(2)} m` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-[10px] text-secondary font-mono">DIRECTION</span>
                          <span className="text-xs font-mono font-bold text-secondary">
                            {metrics ? `${metrics.direction} (${metrics.angle.toFixed(0)}°)` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">No coordinates estimated yet</p>
                )}
              </div>
            );
          })}
          {activeTags.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full text-center py-6">Waiting for tag positions...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFIDTracker;
