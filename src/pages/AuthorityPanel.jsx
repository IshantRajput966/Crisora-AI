import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatDistanceToNow } from 'date-fns';
import { ShieldAlert, Activity, Users, Send, FileText, Package, CloudRain, Flame, Zap, Navigation } from 'lucide-react';
import { useRegionStore, useEventStore } from '../store';
import { regions as regionsApi, events as eventsApi } from '../services/api';
import { DisasterMap } from '../components/Map';
import { RiskMeter, RiskBadge } from '../components/RiskMeter';

const getEventIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'flood': return <CloudRain className="text-blue-500" />;
    case 'fire': return <Flame className="text-orange-500" />;
    case 'earthquake': return <Activity className="text-yellow-500" />;
    case 'cyclone': return <Zap className="text-purple-500" />;
    default: return <ShieldAlert className="text-red-500" />;
  }
};

const AuthorityPanel = () => {
  const { regions, setRegions } = useRegionStore();
  const { events, setEvents } = useEventStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ district: 'All Districts', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, evRes] = await Promise.allSettled([
          regionsApi.getRegions(),
          eventsApi.getDisasterEvents()
        ]);
        
        if (regRes.status === 'fulfilled' && regRes.value?.data) setRegions(regRes.value.data);
        if (evRes.status === 'fulfilled' && evRes.value?.data) setEvents(evRes.value.data);

        // Dummy data fallback
        if (regRes.status === 'rejected' || !regRes.value?.data?.length) {
          setRegions([
            { id: '1', name: 'Mumbai Coast', district: 'Mumbai', riskLevel: 'red', riskScore: 92, lastUpdated: new Date().toISOString(), geojson: { type: "Feature", geometry: { type: "Polygon", coordinates: [[[72.8, 19.0], [73.5, 19.0], [73.5, 18.5], [72.8, 18.5], [72.8, 19.0]]] }} },
            { id: '2', name: 'Pune Central', district: 'Pune', riskLevel: 'yellow', riskScore: 45, lastUpdated: new Date().toISOString(), geojson: { type: "Feature", geometry: { type: "Polygon", coordinates: [[[73.5, 19.0], [74.2, 19.0], [74.2, 18.5], [73.5, 18.5], [73.5, 19.0]]] }} },
            { id: '3', name: 'Nashik Valley', district: 'Nashik', riskLevel: 'orange', riskScore: 78, lastUpdated: new Date().toISOString() }
          ]);
        }
        if (evRes.status === 'rejected' || !evRes.value?.data?.length) {
          setEvents([
            { id: 'e1', name: 'Cyclone Nisarga', type: 'Cyclone', location: 'Coastal Belt', severity: 5, affectedPopulation: 1500000, description: "Category 4 cyclone approaching the western coast. Evacuation protocol initiated in vulnerable areas." },
            { id: 'e2', name: 'Mithi River Overflow', type: 'Flood', location: 'Mumbai Suburbs', severity: 3, affectedPopulation: 250000, description: "Continuous rainfall causing river to breach danger mark. Low-lying areas on standby." }
          ]);
        }
      } catch (error) {
        console.error("Authority fetch error:", error);
      }
    };
    fetchData();
  }, [setRegions, setEvents]);

  const handleBroadcast = (e) => {
    e.preventDefault();
    alert(`[STUB] Broadcasting to ${broadcastData.district}:\n"${broadcastData.message}"`);
    setIsBroadcastModalOpen(false);
    setBroadcastData({ district: 'All Districts', message: '' });
  };

  const tabs = [
    { id: 'overview', label: 'Risk Overview', icon: <Activity size={18} /> },
    { id: 'events', label: 'Active Events', icon: <ShieldAlert size={18} /> },
    { id: 'resources', label: 'Resource Map', icon: <Package size={18} /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-900 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Region Name</th>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4 text-center">Risk Score</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-slate-800">
                {regions.map(region => (
                  <tr key={region.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{region.name}</td>
                    <td className="px-6 py-4 text-slate-400">{region.district || 'Unassigned'}</td>
                    <td className="px-6 py-2 flex justify-center">
                      <div className="transform scale-75 origin-center">
                        <RiskMeter score={region.riskScore} level={region.riskLevel} label="" size={60} />
                      </div>
                    </td>
                    <td className="px-6 py-4"><RiskBadge level={region.riskLevel} /></td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {region.lastUpdated ? formatDistanceToNow(new Date(region.lastUpdated), { addSuffix: true }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-white hover:bg-blue-600/50 text-sm font-medium border border-blue-500/30 px-4 py-2 rounded-lg transition-colors">
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'events':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-slate-700/30 border border-slate-600 rounded-xl overflow-hidden transition-all shadow-md">
                <div className="p-5 flex justify-between items-start border-b border-slate-700/50">
                  <div className="flex gap-4">
                    <div className="mt-1 p-3 bg-slate-800 rounded-xl shadow-inner border border-slate-700">
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{event.name}</h3>
                      <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                        <Navigation size={14} className="opacity-70" /> {event.location}
                      </p>
                      <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                        <Users size={14} className="opacity-70" /> {event.affectedPopulation?.toLocaleString()} potentially affected
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(dot => (
                        <div key={dot} className={`w-2 h-2 rounded-full ${dot <= event.severity ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-slate-600'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Severity {event.severity}/5</span>
                  </div>
                </div>
                
                <div className="p-5">
                  <button 
                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold uppercase tracking-wide rounded-lg border border-slate-600 transition-colors shadow-sm"
                  >
                    {expandedEvent === event.id ? 'Hide Details' : 'View Details & Actions'}
                  </button>
                  
                  {expandedEvent === event.id && (
                    <div className="mt-4 p-5 bg-slate-900/80 rounded-xl border border-slate-700 text-sm text-slate-300 animate-in slide-in-from-top-2 fade-in duration-300">
                      <p className="font-bold text-slate-200 mb-2 uppercase tracking-wider text-xs">Situation Report:</p>
                      <p className="leading-relaxed border-l-2 border-slate-600 pl-3 italic text-slate-400">{event.description || 'No detailed report available.'}</p>
                      <div className="mt-5 flex gap-3">
                         <button className="flex-1 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase hover:bg-red-600/40 transition-colors">Declare Emergency</button>
                         <button className="flex-1 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold uppercase hover:bg-blue-600/40 transition-colors">Deploy NDRF</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'resources':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Mumbai', 'Pune', 'Nashik'].map(dist => (
              <div key={dist} className="bg-slate-700/30 border border-slate-600 rounded-xl p-6 shadow-md hover:bg-slate-700/40 transition-colors">
                <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-600 pb-3">
                  <Navigation size={20} className="text-emerald-400" /> {dist} HQ
                </h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Medical Kits</span>
                    <span className="font-bold text-slate-200 bg-slate-800 px-2 py-1 rounded">1,250</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Life Jackets</span>
                    <span className="font-bold text-slate-200 bg-slate-800 px-2 py-1 rounded">430</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Ambulances</span>
                    <span className="font-bold text-slate-200 bg-slate-800 px-2 py-1 rounded">45</span>
                  </li>
                </ul>
                <button 
                  onClick={() => alert(`[STUB] Dispatch resources to ${dist}`)}
                  className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors shadow-inner"
                >
                  Dispatch Units
                </button>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col space-y-8 font-sans w-full pb-12">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Authority Control Panel</h1>
          <p className="text-sm text-slate-400 mt-1">Statewide Operations & Executive Oversight</p>
        </div>
        <button 
          onClick={() => setIsBroadcastModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-full font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95"
        >
          <Send size={18} /> Broadcast Alert
        </button>
      </div>

      {/* Map Section (60vh) */}
      <div className="w-full h-[60vh] bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden relative">
         <DisasterMap regions={regions} sosAlerts={[]} zoom={6} center={[19.5, 75.0]} />
         <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-600 shadow-lg pointer-events-none">
            <span className="text-sm font-bold text-slate-200 tracking-widest uppercase flex items-center gap-3">
              <Activity size={18} className="text-blue-500 animate-pulse" /> Live Statewide Telemetry
            </span>
         </div>
      </div>

      {/* Tabbed Panel */}
      <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden min-h-[500px]">
        {/* Tabs */}
        <div className="flex border-b border-slate-700 overflow-x-auto bg-slate-900/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-10 py-5 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-blue-400 border-b-[3px] border-blue-500 bg-slate-800' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {renderTabContent()}
        </div>
      </div>

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-red-500 mb-2 flex items-center gap-3">
              <ShieldAlert size={28} /> Emergency Broadcast
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Instantly push an emergency SMS and Push Notification to all citizens in the selected area. This overrides Do Not Disturb settings.
            </p>
            
            <form onSubmit={handleBroadcast} className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">Target Area</label>
                <select 
                  value={broadcastData.district}
                  onChange={(e) => setBroadcastData({...broadcastData, district: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-red-500 font-medium"
                >
                  <option>All Districts (Statewide)</option>
                  <option>Mumbai</option>
                  <option>Pune</option>
                  <option>Nashik</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">Broadcast Message</label>
                <textarea 
                  required
                  rows="5"
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-red-500 resize-none font-medium placeholder-slate-600"
                  placeholder="Official warning message..."
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-2 shadow-lg shadow-red-600/30"
                >
                  <Send size={18} /> Send Alert
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AuthorityPanel;
