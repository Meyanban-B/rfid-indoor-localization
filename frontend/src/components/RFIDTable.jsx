import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { calculateRelativeMetrics } from '../utils/metrics';

const RFIDTable = ({ tags, tagMeta = {}, readerPos }) => {
  const [showRelativeMetrics, setShowRelativeMetrics] = useState(false);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-semibold text-slate-200">Live RFID Readings</h2>
        </div>
        
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
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-6 py-3 font-medium">Tag ID</th>
              <th className="px-6 py-3 font-medium">RSSI (dBm)</th>
              <th className="px-6 py-3 font-medium">Phase (rad)</th>
              <th className="px-6 py-3 font-medium">Est. Position (x, y, z)</th>
              {showRelativeMetrics && (
                <>
                  <th className="px-6 py-3 font-medium text-secondary">Distance</th>
                  <th className="px-6 py-3 font-medium text-secondary">Direction</th>
                </>
              )}
              <th className="px-6 py-3 font-medium">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {Object.values(tags).map((tag) => {
              const metrics = calculateRelativeMetrics(tag.estimated_tag_position, readerPos);

              return (
                <tr key={tag.tag_id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-primary font-bold">{tag.tag_id}</span>
                      {metrics && (
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase" title={`Relative Bearing: ${metrics.angle.toFixed(0)}°`}>
                          {metrics.direction}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 italic font-sans truncate max-w-[150px]" title={tagMeta[tag.tag_id]?.description}>
                      {tagMeta[tag.tag_id]?.description || `Auto-registered tag`}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${tag.rssi > -50 ? 'bg-secondary/20 text-secondary' : tag.rssi > -70 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                      {tag.rssi.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">{tag.phase.toFixed(3)}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">
                    {tag.estimated_tag_position ? 
                      `${tag.estimated_tag_position.x.toFixed(2)}, ${tag.estimated_tag_position.y.toFixed(2)}, ${tag.estimated_tag_position.z.toFixed(2)}` 
                      : 'N/A'}
                  </td>
                  {showRelativeMetrics && (
                    <>
                      <td className="px-6 py-4 font-mono text-secondary font-bold">
                        {metrics ? `${metrics.distance.toFixed(2)} m` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-secondary font-bold">
                        {metrics ? `${metrics.direction} (${metrics.angle.toFixed(0)}°)` : 'N/A'}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(tag.timestamp * 1000).toLocaleTimeString()}
                  </td>
                </tr>
              );
            })}
            {Object.keys(tags).length === 0 && (
              <tr>
                <td colSpan={showRelativeMetrics ? 7 : 5} className="px-6 py-8 text-center text-slate-500">Waiting for live data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RFIDTable;
