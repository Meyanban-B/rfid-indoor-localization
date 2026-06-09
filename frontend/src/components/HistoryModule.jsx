import React, { useState, useEffect, useRef } from 'react';
import { History, Play, Pause, RotateCcw, FastForward, Search, Calendar } from 'lucide-react';

const HistoryModule = () => {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Replay State
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1); // 1x, 2x, 4x
  const replayInterval = useRef(null);

  useEffect(() => {
    // Fetch logs
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${apiBaseUrl}/api/history`)
      .then(res => res.json())
      .then(data => {
        // Sort chronologically for playback
        const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
        setHistoryLogs(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load history", err);
        setLoading(false);
      });
  }, []);

  // Handle playback interval
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 500 / replaySpeed;
      replayInterval.current = setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= historyLogs.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (replayInterval.current) {
        clearInterval(replayInterval.current);
      }
    }
    return () => {
      if (replayInterval.current) {
        clearInterval(replayInterval.current);
      }
    };
  }, [isPlaying, historyLogs, replaySpeed]);

  const handlePlayPause = () => {
    if (replayIndex >= historyLogs.length - 1) {
      setReplayIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setReplayIndex(0);
  };

  const activeReplayItem = historyLogs[replayIndex];

  // Filter logs for table
  const filteredLogs = historyLogs.filter(log => 
    log.tag_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <History className="text-primary w-6 h-6" /> Scan History & Replay
        </h2>
        <p className="text-xs text-slate-400">Review, query, and replay historical RFID tag logs</p>
      </div>

      {/* Historical Trajectory Replay Canvas */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Trajectory Replay Player</h3>
            <p className="text-xs text-slate-500">Step through coordinate updates chronologically</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReplaySpeed(1)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${replaySpeed === 1 ? 'bg-primary/20 text-primary border-primary/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
            >
              1x
            </button>
            <button
              onClick={() => setReplaySpeed(2)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${replaySpeed === 2 ? 'bg-primary/20 text-primary border-primary/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
            >
              2x
            </button>
            <button
              onClick={() => setReplaySpeed(4)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${replaySpeed === 4 ? 'bg-primary/20 text-primary border-primary/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
            >
              4x
            </button>
          </div>
        </div>

        {/* Replay Visualizer Mini-Board */}
        <div className="h-48 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
          {historyLogs.length > 0 && activeReplayItem ? (
            <div className="w-full h-full p-4 flex flex-col justify-between">
              {/* Playback Grid Projection */}
              <div className="flex-1 relative flex items-center justify-center">
                {/* Visual indicator of reader vs tag position */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 opacity-10">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="border border-slate-700"></div>
                  ))}
                </div>
                {/* Render Tag */}
                <div 
                  className="absolute w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_#3b82f6] border border-white flex items-center justify-center text-[8px] font-bold text-white transition-all duration-300"
                  style={{
                    left: `${(activeReplayItem.reader_position?.x / 5) * 80 + 10}%`,
                    top: `${(activeReplayItem.reader_position?.y / 5) * 80 + 10}%`
                  }}
                >
                  R
                </div>
                <div 
                  className="absolute w-3 h-3 bg-secondary rounded-full shadow-[0_0_8px_#10b981] border border-white transition-all duration-300"
                  style={{
                    // Mock coordinates since reader position changes and tags are fixed
                    left: `${(replayIndex % 5) * 15 + 20}%`,
                    top: `${(Math.sin(replayIndex) + 1) * 30 + 20}%`
                  }}
                ></div>
              </div>
              
              {/* Stats overlay */}
              <div className="flex justify-between items-center text-xs font-mono bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-primary font-bold">{activeReplayItem.tag_id}</span>
                <span className="text-slate-400">RSSI: {activeReplayItem.rssi.toFixed(1)} dBm</span>
                <span className="text-slate-400">Phase: {activeReplayItem.phase.toFixed(3)} rad</span>
                <span className="text-slate-500">{new Date(activeReplayItem.timestamp * 1000).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">No replay frames available</span>
          )}
        </div>

        {/* Player Navigation Buttons */}
        <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-lg border border-slate-800">
          <button
            onClick={handlePlayPause}
            disabled={historyLogs.length === 0}
            className="bg-primary hover:bg-primary/95 disabled:bg-slate-800 disabled:text-slate-600 text-slate-100 p-2.5 rounded-lg transition-colors flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleReset}
            disabled={historyLogs.length === 0}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-lg border border-slate-750 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Timeline slider */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500">{replayIndex + 1}</span>
            <input
              type="range"
              min="0"
              max={Math.max(0, historyLogs.length - 1)}
              value={replayIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setReplayIndex(Number(e.target.value));
              }}
              className="flex-1 accent-primary h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-500">{historyLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Database log table */}
      <div className="glass-panel overflow-hidden">
        {/* Table Filters */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-800/20 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-300">RFID Event Logs</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter Tag ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Log list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850/50 text-slate-400 font-mono">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Tag ID</th>
                <th className="px-6 py-3 font-medium">RSSI</th>
                <th className="px-6 py-3 font-medium">Phase</th>
                <th className="px-6 py-3 font-medium">Frequency</th>
                <th className="px-6 py-3 font-medium">Reader Position (X, Y)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-3 text-slate-500 font-mono">
                    {new Date(log.timestamp * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 font-mono font-bold text-primary">{log.tag_id}</td>
                  <td className="px-6 py-3 font-mono">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${log.rssi > -50 ? 'text-secondary bg-secondary/10' : 'text-red-500 bg-red-500/10'}`}>
                      {log.rssi.toFixed(1)} dBm
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-slate-300">{log.phase.toFixed(3)} rad</td>
                  <td className="px-6 py-3 text-slate-400 font-mono">{(log.frequency / 1e6).toFixed(1)} MHz</td>
                  <td className="px-6 py-3 font-mono text-slate-400">
                    {log.reader_position ? `${log.reader_position.x.toFixed(2)}, ${log.reader_position.y.toFixed(2)}` : 'N/A'}
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Querying historical database records...</td>
                </tr>
              )}
              {!loading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No events found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryModule;
