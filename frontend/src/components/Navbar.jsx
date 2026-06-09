import React from 'react';
import { Activity, Bell, Settings, User, Menu } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, isConnected, setSidebarOpen }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: '2d-view', label: '2D View' },
    { id: '3d-view', label: '3D View' },
    { id: 'active-tags', label: 'Active Tags' },
    { id: 'tracker-list', label: 'Tracker List' },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3.5 mb-6 backdrop-blur-md">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2 md:gap-3 text-primary select-none">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="bg-primary/10 p-2 rounded-lg border border-primary/20 animate-pulse hidden sm:block">
          <Activity className="w-5 h-5" />
        </div>
        <h1 className="text-base md:text-lg font-bold tracking-wider text-slate-100">
          POLAR <span className="text-slate-400 font-light">SYSTEM</span>
        </h1>
      </div>

      {/* Center Tabs */}
      <div className="hidden md:flex items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/50' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
          <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${isConnected ? 'bg-secondary animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-[10px] md:text-xs font-mono font-medium text-slate-400 uppercase hidden sm:inline">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Notifications Icon */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
          {isConnected && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"></span>
          )}
        </button>

        {/* Quick Settings Icon */}
        <button 
          onClick={() => setActiveTab('settings')}
          className={`p-2 transition-colors ${activeTab === 'settings' ? 'text-primary' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-slate-800"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1 select-none">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200">Alpha Member</p>
            <p className="text-[10px] text-slate-500 font-mono">Operator</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
