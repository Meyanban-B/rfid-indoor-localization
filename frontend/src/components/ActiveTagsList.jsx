import React, { useState } from 'react';
import { Tag, Search, Radio, Clock, Edit2, Check, X } from 'lucide-react';
import { calculateRelativeMetrics } from '../utils/metrics';

const ActiveTagsList = ({ tags, tagMeta = {}, readerPos, onUpdateTagDescription }) => {
  const [showRelativeMetrics, setShowRelativeMetrics] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  const tagList = Object.values(tags);
  const now = Date.now() / 1000;

  // Filter list
  const filtered = tagList.filter(tag => 
    tag.tag_id.toLowerCase().includes(search.toLowerCase()) ||
    (tagMeta[tag.tag_id]?.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Tag className="text-primary w-6 h-6" /> Active RFID Tags
          </h2>
          <p className="text-xs text-slate-400">Manage, locate, and audit all active passive tag transponders in the venue</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Relative metrics toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-800/50 hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-700/50 transition-colors">
            <input
              type="checkbox"
              checked={showRelativeMetrics}
              onChange={(e) => setShowRelativeMetrics(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
            />
            <span className="text-xs text-slate-350 font-medium hover:text-slate-200 transition-colors">Show Distance/Bearing</span>
          </label>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tags or friendly names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary/50 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tag) => {
          // If seen in the last 5 seconds, it's online
          const isOnline = (now - tag.timestamp) < 5;
          const timeDiff = Math.max(0, Math.floor(now - tag.timestamp));
          const desc = tagMeta[tag.tag_id]?.description || `Auto-registered ${tag.tag_id}`;
          const isEditing = editingId === tag.tag_id;
          const metrics = calculateRelativeMetrics(tag.estimated_tag_position, readerPos);

          return (
            <div 
              key={tag.tag_id}
              className={`glass-panel p-6 border-t-2 transition-all duration-300 ${
                isOnline ? 'border-secondary/40 hover:border-secondary' : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 w-full min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${isOnline ? 'bg-secondary/15 text-secondary' : 'bg-slate-800 text-slate-500'}`}>
                    <Radio className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-mono text-sm font-bold text-slate-200">{tag.tag_id}</h3>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2 py-0.5 focus:outline-none focus:border-primary/50 w-full font-sans"
                          placeholder="Type friendly name..."
                          autoFocus
                        />
                        <button
                          onClick={async () => {
                            if (onUpdateTagDescription) {
                              await onUpdateTagDescription(tag.tag_id, editingText);
                            }
                            setEditingId(null);
                          }}
                          className="p-1 rounded bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 shrink-0"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 shrink-0"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-1 group">
                        <p className="text-xs text-slate-400 italic truncate max-w-[140px] font-sans" title={desc}>
                          {desc}
                        </p>
                        <button
                          onClick={() => {
                            setEditingId(tag.tag_id);
                            setEditingText(desc);
                          }}
                          className="p-0.5 rounded text-slate-650 hover:text-slate-350 hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                          title="Rename Tag"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{(tag.frequency / 1e6).toFixed(1)} MHz</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {metrics && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold uppercase" title={`Relative Bearing: ${metrics.angle.toFixed(0)}°`}>
                      {metrics.direction}
                    </span>
                  )}
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-secondary animate-pulse' : 'bg-red-500'}`}></span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {isOnline ? 'Active' : 'Stale'}
                  </span>
                </div>
              </div>

              {/* Tag Details */}
              <div className="space-y-2 border-t border-slate-800/60 pt-3 text-xs">
                <div className="flex justify-between text-slate-400 font-mono">
                  <span>RSSI Level:</span>
                  <span className={tag.rssi > -50 ? 'text-secondary font-bold' : 'text-slate-200 font-bold'}>
                    {tag.rssi.toFixed(1)} dBm
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 font-mono">
                  <span>Phase Value:</span>
                  <span className="text-slate-200">{tag.phase.toFixed(3)} rad</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Location Status:</span>
                  <span className="text-slate-200 font-mono">
                    {tag.estimated_tag_position 
                      ? `${tag.estimated_tag_position.x.toFixed(2)}, ${tag.estimated_tag_position.y.toFixed(2)}, ${tag.estimated_tag_position.z.toFixed(2)}`
                      : 'N/A'}
                  </span>
                </div>
                {showRelativeMetrics && (
                  <div className="pt-2 border-t border-slate-800/40 space-y-2">
                    <div className="flex justify-between text-secondary font-mono">
                      <span>Rel. Distance:</span>
                      <span className="font-bold">{metrics ? `${metrics.distance.toFixed(2)} m` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-secondary font-mono">
                      <span>Rel. Direction:</span>
                      <span className="font-bold">{metrics ? `${metrics.direction} (${metrics.angle.toFixed(0)}°)` : 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Time differences footer */}
              <div className="flex items-center gap-1 mt-4 text-[10px] text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <span>Last signal received: {timeDiff}s ago</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 col-span-full text-center py-12">No active tags found.</p>
        )}
      </div>
    </div>
  );
};

export default ActiveTagsList;
