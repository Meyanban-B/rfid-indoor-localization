import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Database, Sun, Moon } from 'lucide-react';

const SettingsPanel = () => {
  const [mqttBroker, setMqttBroker] = useState('broker.hivemq.com');
  const [mqttPort, setMqttPort] = useState('1883');
  const [mqttTopic, setMqttTopic] = useState('rfid_localization_alpha_team_e22d');
  
  const [systemMode, setSystemMode] = useState('synthetic'); // synthetic or hardware
  const [refreshInterval, setRefreshInterval] = useState('500'); // 500ms, 1s, 2s
  const [theme, setTheme] = useState('dark');
  
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBroker = localStorage.getItem('polar_mqtt_broker');
    const savedPort = localStorage.getItem('polar_mqtt_port');
    const savedTopic = localStorage.getItem('polar_mqtt_topic');
    const savedMode = localStorage.getItem('polar_system_mode');
    const savedInterval = localStorage.getItem('polar_refresh_interval');
    const savedTheme = localStorage.getItem('polar_theme') || 'dark';

    if (savedBroker) setMqttBroker(savedBroker);
    if (savedPort) setMqttPort(savedPort);
    if (savedTopic) setMqttTopic(savedTopic);
    if (savedMode) setSystemMode(savedMode);
    if (savedInterval) setRefreshInterval(savedInterval);
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('polar_theme', newTheme);
    window.dispatchEvent(new Event('themechange'));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('polar_mqtt_broker', mqttBroker);
    localStorage.setItem('polar_mqtt_port', mqttPort);
    localStorage.setItem('polar_mqtt_topic', mqttTopic);
    localStorage.setItem('polar_system_mode', systemMode);
    localStorage.setItem('polar_refresh_interval', refreshInterval);
    localStorage.setItem('polar_theme', theme);

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="text-primary w-6 h-6" /> System Configuration
        </h2>
        <p className="text-xs text-slate-400">Configure connection streams, operational triggers, and visual parameters</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* MQTT Config */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" /> MQTT Broker Settings
          </h3>
          <p className="text-xs text-slate-500">Configure the broker coordinates handling system payload feeds</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Broker URL</label>
              <input
                type="text"
                value={mqttBroker}
                onChange={(e) => setMqttBroker(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Broker Port</label>
              <input
                type="number"
                value={mqttPort}
                onChange={(e) => setMqttPort(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">MQTT Topic</label>
              <input
                type="text"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary/50 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Operational Modes */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Tracking Engine Modes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode Select */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold">Active Input Mode</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSystemMode('synthetic')}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    systemMode === 'synthetic'
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-250'
                  }`}
                >
                  Synthetic Simulator
                </button>
                <button
                  type="button"
                  onClick={() => setSystemMode('hardware')}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    systemMode === 'hardware'
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-250'
                  }`}
                >
                  Real RFID Hardware
                </button>
              </div>
            </div>

            {/* Refresh times */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold">UI Refresh Interval</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary/50"
              >
                <option value="250">High Speed (250 ms)</option>
                <option value="500">Standard (500 ms)</option>
                <option value="1000">Eco-mode (1 sec)</option>
                <option value="2000">Low Frequency (2 sec)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-yellow-500" />}
            Visual Theme Settings
          </h3>
          <p className="text-xs text-slate-500">Choose between light and dark UI themes for your environment</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold">Dashboard Theme</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-250'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    theme === 'light'
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-250'
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 items-center">
          {showSavedToast && (
            <span className="flex items-center gap-1 text-xs text-secondary font-medium mr-2">
              <CheckCircle className="w-4 h-4" /> Preferences applied successfully!
            </span>
          )}
          
          <button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-slate-100 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;
