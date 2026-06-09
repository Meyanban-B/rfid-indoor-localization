import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Wifi, Info, Radio, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

const SignalStrength = ({ tags }) => {
  const [selectedTag, setSelectedTag] = useState('');
  const [rssiHistory, setRssiHistory] = useState({}); // tag_id -> array of values

  const tagList = Object.keys(tags);

  useEffect(() => {
    if (tagList.length > 0 && !selectedTag) {
      setSelectedTag(tagList[0]);
    }
  }, [tagList, selectedTag]);

  // Track RSSI history
  useEffect(() => {
    const now = new Date().toLocaleTimeString();
    
    setRssiHistory(prev => {
      const updated = { ...prev };
      Object.entries(tags).forEach(([id, tag]) => {
        if (!updated[id]) {
          updated[id] = { labels: [], data: [] };
        }
        
        // Add new reading
        updated[id].labels.push(now);
        updated[id].data.push(tag.rssi);

        // Keep last 20 readings
        if (updated[id].data.length > 20) {
          updated[id].labels.shift();
          updated[id].data.shift();
        }
      });
      return updated;
    });
  }, [tags]);

  const activeTagData = tags[selectedTag];
  const history = rssiHistory[selectedTag] || { labels: [], data: [] };

  const chartData = {
    labels: history.labels,
    datasets: [
      {
        fill: true,
        label: 'RSSI (dBm)',
        data: history.data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        pointRadius: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#cbd5e1',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        min: -90,
        max: -30,
        grid: {
          color: 'rgba(51, 65, 85, 0.3)'
        },
        ticks: {
          color: '#64748b',
          font: { family: 'monospace' }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          display: false // hide timestamps on x axis for dense clean layout
        }
      }
    }
  };

  // Helper to determine signal quality index
  const getQualityText = (rssi) => {
    if (!rssi) return 'Unknown';
    if (rssi > -50) return 'Excellent';
    if (rssi > -70) return 'Good';
    return 'Weak';
  };

  const getQualityColor = (rssi) => {
    if (!rssi) return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    if (rssi > -50) return 'text-secondary bg-secondary/10 border-secondary/20';
    if (rssi > -70) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wifi className="text-primary w-6 h-6" /> Signal Strength Monitor
          </h2>
          <p className="text-xs text-slate-400">Live RFID signal strength index and quality metrics</p>
        </div>
        
        {/* Selector */}
        {tagList.length > 0 && (
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50"
          >
            {tagList.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        )}
      </div>

      {tagList.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-500">
          <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          Waiting for live tags telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signal Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Stats */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-400">Tag Diagnostics</h3>
              <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">Selected ID</span>
                <span className="text-sm font-mono font-bold text-primary">{selectedTag}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">RSSI Value</span>
                <span className="text-sm font-mono text-slate-200 font-bold">
                  {activeTagData?.rssi ? `${activeTagData.rssi.toFixed(1)} dBm` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Signal Quality</span>
                <span className={`px-2 py-0.5 rounded text-xs border font-semibold ${getQualityColor(activeTagData?.rssi)}`}>
                  {getQualityText(activeTagData?.rssi)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Phase Angle</span>
                <span className="text-sm font-mono text-slate-200">
                  {activeTagData?.phase ? `${activeTagData.phase.toFixed(3)} rad` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Frequency Band</span>
                <span className="text-sm font-mono text-slate-200">
                  {activeTagData?.frequency ? `${(activeTagData.frequency / 1e6).toFixed(1)} MHz` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Antenna Stats */}
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent" /> Antenna Telemetry
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Power Efficiency</span>
                    <span>94%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-accent h-1.5 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Noise Margin</span>
                    <span>12 dB</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-secondary h-1.5 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart View */}
          <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Live RSSI Track
              </h3>
              <p className="text-xs text-slate-500 mb-4">Real-time signal variance over last 20 measurements</p>
            </div>
            <div className="h-64 relative flex items-center justify-center">
              {history.data.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <span className="text-xs text-slate-500">Awaiting stream packets...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalStrength;
