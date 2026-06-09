import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Target, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

// Map of simulator's true tag coordinates to compute absolute error deviations
const TRUE_POSITIONS = {
  "RFID_001": { x: 1.0, y: 1.0, z: 0.5 },
  "RFID_002": { x: 4.0, y: 1.0, z: 0.5 },
  "RFID_003": { x: 1.0, y: 4.0, z: 0.5 },
  "RFID_004": { x: 4.0, y: 4.0, z: 0.5 },
  "RFID_005": { x: 2.5, y: 2.5, z: 0.5 },
};

const AccuracyAnalytics = ({ tags }) => {
  const [errorMetrics, setErrorMetrics] = useState({});

  useEffect(() => {
    setErrorMetrics(prev => {
      const updated = { ...prev };
      Object.entries(tags).forEach(([id, tag]) => {
        const truePos = TRUE_POSITIONS[id];
        const estPos = tag.estimated_tag_position;
        
        if (truePos && estPos) {
          // Calculate Euclidean Distance Error
          const dx = estPos.x - truePos.x;
          const dy = estPos.y - truePos.y;
          const dz = estPos.z - truePos.z;
          const error = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (!updated[id]) {
            updated[id] = { current: error, history: [] };
          } else {
            updated[id].current = error;
          }
          
          updated[id].history.push(error);
          if (updated[id].history.length > 30) {
            updated[id].history.shift();
          }
        }
      });
      return updated;
    });
  }, [tags]);

  const activeTagIds = Object.keys(errorMetrics);
  
  // Calculate average, max and confidence
  let totalError = 0;
  let maxError = 0;
  let count = 0;

  activeTagIds.forEach(id => {
    const err = errorMetrics[id].current;
    totalError += err;
    if (err > maxError) maxError = err;
    count++;
  });

  const avgError = count > 0 ? totalError / count : 0;
  // Let accuracy % be (1 - avgError) * 100 clamped between 0 and 99.9%
  const avgAccuracy = count > 0 ? Math.max(0, Math.min(99.9, (1 - avgError) * 100)) : 0;

  const barChartData = {
    labels: activeTagIds,
    datasets: [
      {
        label: 'Error (meters)',
        data: activeTagIds.map(id => errorMetrics[id].current),
        backgroundColor: activeTagIds.map(id => {
          const err = errorMetrics[id].current;
          if (err < 0.15) return 'rgba(16, 185, 129, 0.6)'; // emerald
          if (err < 0.25) return 'rgba(245, 158, 11, 0.6)'; // amber
          return 'rgba(239, 68, 68, 0.6)'; // red
        }),
        borderColor: activeTagIds.map(id => {
          const err = errorMetrics[id].current;
          if (err < 0.15) return '#10b981';
          if (err < 0.25) return '#f59e0b';
          return '#ef4444';
        }),
        borderWidth: 1.5,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        min: 0,
        max: 0.5,
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
          color: '#94a3b8',
          font: { family: 'monospace' }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Target className="text-primary w-6 h-6" /> Accuracy & Analytics
        </h2>
        <p className="text-xs text-slate-400">Localization confidence limits, variance scores, and coordinate deviations</p>
      </div>

      {/* Numerical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Accuracy Gauges */}
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="bg-secondary/10 p-3 rounded-xl border border-secondary/20 text-secondary">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Mean Accuracy</p>
            <p className="text-2xl font-bold text-slate-100 mt-0.5">{avgAccuracy.toFixed(1)}%</p>
          </div>
        </div>

        {/* Average Deviation */}
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Mean Displacement Error</p>
            <p className="text-2xl font-bold text-slate-100 mt-0.5">{avgError.toFixed(3)} m</p>
          </div>
        </div>

        {/* Max Error Deviation */}
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Peak Displacement Deviation</p>
            <p className="text-2xl font-bold text-slate-100 mt-0.5">{maxError.toFixed(3)} m</p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Tag Real-time Error Deviations</h3>
          <p className="text-xs text-slate-500 mb-6">Euclidean coordinates distance error comparing estimated position vs actual position</p>
          <div className="h-64 relative flex items-center justify-center">
            {activeTagIds.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <span className="text-xs text-slate-500">Waiting for live data calculations...</span>
            )}
          </div>
        </div>

        {/* Tags detail table */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Precision Logs</h3>
            <div className="space-y-4">
              {activeTagIds.map(id => {
                const err = errorMetrics[id].current;
                let statusColor = 'text-secondary';
                if (err >= 0.15 && err < 0.25) statusColor = 'text-yellow-500';
                if (err >= 0.25) statusColor = 'text-red-500';
                
                return (
                  <div key={id} className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                    <span className="font-mono font-bold text-slate-400">{id}</span>
                    <span className={`font-mono font-semibold ${statusColor}`}>
                      {err.toFixed(3)} m
                    </span>
                  </div>
                );
              })}
              {activeTagIds.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">Awaiting telemetry logs...</p>
              )}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 mt-4 text-[10px] text-slate-500">
            <strong>Solver confidence scale:</strong> Emerald (&lt; 0.15m deviation), Amber (&lt; 0.25m deviation), Red (&gt; 0.25m deviation).
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccuracyAnalytics;
export { TRUE_POSITIONS };
