import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, ServerCrash, RefreshCw } from 'lucide-react';

const TrackerList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = () => {
    setLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${apiBaseUrl}/api/devices`)
      .then(res => res.json())
      .then(data => {
        setDevices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load tracking devices", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="text-primary w-6 h-6" /> Tracker & Device Manager
          </h2>
          <p className="text-xs text-slate-400">Monitor health, IP configurations, and antenna activity of system hardware</p>
        </div>
        
        <button 
          onClick={fetchDevices}
          className="bg-slate-800 hover:bg-slate-750 text-slate-300 p-2 rounded-lg border border-slate-700 transition-colors flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((dev) => {
          const isOnline = dev.status.toLowerCase() === 'online';

          return (
            <div key={dev.id} className="glass-panel p-6 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg border ${
                    isOnline 
                      ? 'bg-secondary/10 border-secondary/20 text-secondary' 
                      : 'bg-slate-800 border-slate-750 text-slate-500'
                  }`}>
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-slate-200">{dev.id}</h3>
                    <p className="text-xs text-slate-500">{dev.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-secondary animate-pulse' : 'bg-red-500'}`}></span>
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    {dev.status}
                  </span>
                </div>
              </div>

              {/* Specs */}
              <div className="border-t border-slate-800/60 pt-4 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>IPv4 Address:</span>
                  <span className="font-mono text-slate-200">{dev.ip_address || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Heartbeat check:</span>
                  <span className="text-slate-200">{dev.last_seen || 'N/A'}</span>
                </div>
                
                {/* Antennas */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Antenna Port Bindings</p>
                  <div className="space-y-1">
                    {dev.antennas && dev.antennas.map((ant, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-900/50 p-2 rounded border border-slate-850">
                        <span className="text-slate-400">{ant}</span>
                        <span className={`w-2 h-2 rounded-full ${isOnline && ant.includes('Active') ? 'bg-secondary animate-pulse' : 'bg-slate-700'}`}></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {devices.length === 0 && !loading && (
          <div className="col-span-full glass-panel p-12 text-center text-slate-500">
            <ServerCrash className="w-8 h-8 mx-auto mb-2 text-slate-650" />
            No readers or tracking units connected.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackerList;
