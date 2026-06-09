import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RFIDTable from '../components/RFIDTable';
import Scene3D from '../components/Scene3D';
import SignalStrength from '../components/SignalStrength';
import RFIDTracker from '../components/RFIDTracker';
import AccuracyAnalytics from '../components/AccuracyAnalytics';
import HistoryModule from '../components/HistoryModule';
import BayScan from '../components/BayScan';
import ActiveTagsList from '../components/ActiveTagsList';
import TrackerList from '../components/TrackerList';
import SettingsPanel from '../components/SettingsPanel';
import Visualizer2D from '../components/Visualizer2D';
import { wsService } from '../services/websocket';
import { Activity, Radio, Database } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tags, setTags] = useState({});
  const [readerPos, setReaderPos] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tagMeta, setTagMeta] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchTagMeta = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBaseUrl}/tags`);
      if (res.ok) {
        const data = await res.json();
        const meta = {};
        data.forEach(t => {
          meta[t.id] = t;
        });
        setTagMeta(meta);
      }
    } catch (err) {
      console.error("Failed to fetch tag metadata", err);
    }
  };

  const handleUpdateTagDescription = async (tagId, description) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBaseUrl}/tags/${tagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        await fetchTagMeta();
      } else {
        console.error("Failed to update tag description");
      }
    } catch (err) {
      console.error("Error updating tag description", err);
    }
  };

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('polar_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Initialize sidebar based on screen width (open on desktop, closed on mobile)
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }

    fetchTagMeta();

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live';
    wsService.connect(wsUrl);

    const interval = setInterval(() => {
      setIsConnected(wsService.socket?.readyState === WebSocket.OPEN);
    }, 1000);

    const unsubscribe = wsService.subscribe((data) => {
      setTags(prev => ({
        ...prev,
        [data.tag_id]: data
      }));
      if (data.reader_position) {
        setReaderPos(data.reader_position);
      }
    });

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const activeTagCount = Object.values(tags).filter(
    t => (Date.now() / 1000 - t.timestamp) < 5
  ).length;

  const renderMainDashboard = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-secondary' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-xl font-bold text-slate-100">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>
          <Activity className={`w-10 h-10 ${isConnected ? 'text-secondary animate-pulse' : 'text-slate-600'}`} />
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Active Tags (5s)</p>
            <p className="text-3xl font-bold text-slate-100">{activeTagCount}</p>
          </div>
          <Radio className="w-10 h-10 text-primary" />
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Tags Tracked</p>
            <p className="text-3xl font-bold text-slate-100">{Object.keys(tags).length}</p>
          </div>
          <Database className="w-10 h-10 text-accent" />
        </div>
      </div>

      {/* Main Grid Visualizer + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Scene3D tags={tags} readerPos={readerPos} />
        </div>
        <div className="flex flex-col gap-6">
          <RFIDTable tags={tags} tagMeta={tagMeta} readerPos={readerPos} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Top Navbar */}
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isConnected={isConnected} setSidebarOpen={setSidebarOpen} />

          {/* Dynamic Pane Routing */}
          <main className="transition-all duration-300">
            {activeTab === 'dashboard' && renderMainDashboard()}
            {activeTab === 'signal' && <SignalStrength tags={tags} />}
            {activeTab === 'tracker' && <RFIDTracker tags={tags} readerPos={readerPos} />}
            {activeTab === 'accuracy' && <AccuracyAnalytics tags={tags} />}
            {activeTab === 'history' && <HistoryModule />}
            {activeTab === 'bay-scan' && <BayScan tags={tags} />}
            {activeTab === '2d-view' && <Visualizer2D tags={tags} readerPos={readerPos} />}
            {activeTab === '3d-view' && <Scene3D tags={tags} readerPos={readerPos} fullHeight={true} />}
            {activeTab === 'active-tags' && (
              <ActiveTagsList 
                tags={tags} 
                tagMeta={tagMeta} 
                readerPos={readerPos}
                onUpdateTagDescription={handleUpdateTagDescription} 
              />
            )}
            {activeTab === 'tracker-list' && <TrackerList />}
            {activeTab === 'settings' && <SettingsPanel />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
