import React, { useState } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Wifi, 
  MapPin, 
  Target, 
  History, 
  Warehouse, 
  Square, 
  Box, 
  Tag, 
  Cpu, 
  Settings,
  X
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'signal', label: 'Signal Strength', icon: Wifi },
    { id: 'tracker', label: 'Tracker', icon: MapPin },
    { id: 'accuracy', label: 'Accuracy', icon: Target },
    { id: 'history', label: 'History', icon: History },
    { id: 'bay-scan', label: 'Bay Scan', icon: Warehouse },
    { id: '2d-view', label: '2D View', icon: Square },
    { id: '3d-view', label: '3D View', icon: Box },
    { id: 'active-tags', label: 'Active Tags', icon: Tag },
    { id: 'tracker-list', label: 'Tracker List', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 flex flex-col h-screen transition-all duration-300 shrink-0 lg:sticky lg:top-0 ${
        sidebarOpen 
          ? 'translate-x-0 w-64 opacity-100 border-r border-slate-800/80' 
          : '-translate-x-full w-64 border-r border-slate-800/80 lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden lg:border-none'
      }`}>
        {/* Search & Header Section */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          {/* Close button for mobile screens */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-slate-950 border border-slate-800 hover:text-slate-200 text-slate-400 transition-colors"
            title="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
        {filteredItems.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4">No sections found</p>
        )}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-800/80 text-center bg-slate-950/20">
        <span className="text-xs text-slate-600 font-mono">POLAR v1.0.0</span>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
