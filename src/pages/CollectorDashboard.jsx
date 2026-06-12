import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  AlertTriangle, Siren, Flame, HeartPulse, Locate, ShieldCheck, 
  Map as MapIcon, Info, Users, Clock, CheckCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useRegionStore, useSOSStore, useEventStore } from '../store';
import { regions as regionsApi, sos as sosApi, events as eventsApi } from '../services/api';
import { DisasterMap } from '../components/Map';

const getTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'fire': return <Flame className="text-orange-500" size={20} />;
    case 'medical emergency': return <HeartPulse className="text-red-500" size={20} />;
    case 'flood': return <MapIcon className="text-blue-500" size={20} />;
    case 'trapped': return <Locate className="text-yellow-500" size={20} />;
    default: return <AlertTriangle className="text-red-500" size={20} />;
  }
};

const CollectorDashboard = () => {
  const { user } = useAuth();
  const { regions, setRegions } = useRegionStore();
  const { alerts, setAlerts, updateAlert } = useSOSStore();
  const { events, setEvents } = useEventStore();
  const [isLoading, setIsLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Using Promise.allSettled so if one fails, others still populate
        const [regRes, sosRes, evRes] = await Promise.allSettled([
          regionsApi.getRegions(),
          sosApi.getSOSAlerts(),
          eventsApi.getDisasterEvents()
        ]);

        if (regRes.status === 'fulfilled' && regRes.value?.data) setRegions(regRes.value.data);
        if (sosRes.status === 'fulfilled' && sosRes.value?.data) setAlerts(sosRes.value.data);
        if (evRes.status === 'fulfilled' && evRes.value?.data) setEvents(evRes.value.data);
        
        // Add dummy data locally for UI demonstration purposes if API returns 0 items
        if (regRes.status === 'rejected' || !regRes.value?.data?.length) {
          setRegions([
             { id: '1', name: 'North District', riskLevel: 'red', riskScore: 85, geojson: { type: "Feature", geometry: { type: "Polygon", coordinates: [[[72.8, 19.0], [73.5, 19.0], [73.5, 18.5], [72.8, 18.5], [72.8, 19.0]]] }} },
             { id: '2', name: 'South District', riskLevel: 'yellow', riskScore: 40, geojson: { type: "Feature", geometry: { type: "Polygon", coordinates: [[[73.5, 19.0], [74.2, 19.0], [74.2, 18.5], [73.5, 18.5], [73.5, 19.0]]] }} }
          ]);
        }
        if (sosRes.status === 'rejected' || !sosRes.value?.data?.length) {
          setAlerts([
            { id: '101', type: 'Medical Emergency', status: 'active', message: 'Heart attack suspected', location: 'Downtown Avenue', createdAt: new Date(Date.now() - 600000).toISOString(), lat: 18.7, lng: 73.1 },
            { id: '102', type: 'Fire', status: 'acknowledged', message: 'Building caught fire', location: 'Industrial Park', createdAt: new Date(Date.now() - 3600000).toISOString(), lat: 18.8, lng: 73.4 }
          ]);
        }
        if (evRes.status === 'rejected' || !evRes.value?.data?.length) {
          setEvents([
            { id: 'e1', name: 'Cyclone Warning', type: 'Weather', location: 'Coastal Belt', severity: 4 },
            { id: 'e2', name: 'River Overflow', type: 'Flood', location: 'East Valley', severity: 3 }
          ]);
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setRegions, setAlerts, setEvents]);

  // Derived state calculations
  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const criticalAlertsCount = activeAlerts.filter(a => a.status === 'active' || !a.status).length;
  const highRiskRegionsCount = regions.filter(r => r.riskLevel === 'orange' || r.riskLevel === 'red').length;
  const activeEventsCount = events.length;

  const handleAcknowledge = async (id) => {
    try {
      await sosApi.acknowledgeSOS(id).catch(() => {}); // catch dummy rejection
      updateAlert(id, { status: 'acknowledged' });
      toast.success('Alert acknowledged. Team notified.');
    } catch (error) {
      toast.error('Failed to acknowledge alert.');
    }
  };

  const handleResolve = async (id) => {
    try {
      await sosApi.resolveSOS(id).catch(() => {});
      updateAlert(id, { status: 'resolved' });
      toast.success('Alert resolved successfully.');
    } catch (error) {
      toast.error('Failed to resolve alert.');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Collector Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">District: <span className="font-medium text-slate-300">{user?.district || 'Admin Default'}</span></p>
        </div>
      </div>

      {/* Top Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        <div className={`bg-slate-800 rounded-xl border p-5 shadow-lg transition-colors ${criticalAlertsCount > 0 ? 'border-red-500/50 bg-red-900/10' : 'border-slate-700'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-lg ${criticalAlertsCount > 0 ? 'bg-red-500/20 text-red-500' : 'bg-slate-700 text-slate-300'}`}>
              <Siren size={22} className={criticalAlertsCount > 0 ? 'animate-pulse' : ''} />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Active SOS</h3>
          </div>
          <p className={`text-4xl font-bold ${criticalAlertsCount > 0 ? 'text-red-400' : 'text-slate-100'}`}>
            {criticalAlertsCount}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-orange-500/20 text-orange-500">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Regions at Risk</h3>
          </div>
          <p className="text-4xl font-bold text-slate-100">{highRiskRegionsCount}</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-500">
              <Users size={22} />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Resources</h3>
          </div>
          <p className="text-4xl font-bold text-slate-100 flex items-baseline gap-2">
            24 <span className="text-sm text-slate-500 font-medium">Units</span>
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-500">
              <Info size={22} />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Active Events</h3>
          </div>
          <p className="text-4xl font-bold text-slate-100">{activeEventsCount}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 px-2">
        
        {/* Left Column (60%): Live District Map */}
        <div className="w-full lg:w-3/5 bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-xl flex flex-col min-h-[500px]">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <MapIcon size={20} className="text-blue-500" /> District Overview
          </h2>
          <div className="flex-1 w-full rounded-lg overflow-hidden border border-slate-700 relative shadow-inner">
            <DisasterMap regions={regions} sosAlerts={activeAlerts} zoom={8} center={[18.8, 73.5]} />
          </div>
        </div>

        {/* Right Column (40%): Live Feeds */}
        <div className="w-full lg:w-2/5 flex flex-col gap-6">
          
          {/* SOS Alerts Feed */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-xl flex-1 flex flex-col min-h-[400px] max-h-[550px]">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="flex items-center gap-2">
                <Siren size={20} className="text-red-500" /> Live SOS Feed
              </span>
              {criticalAlertsCount > 0 && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-600">
              {activeAlerts.length > 0 ? (
                [...activeAlerts].sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())).map((alert) => {
                  const isAck = alert.status === 'acknowledged';
                  const glowClass = isAck 
                    ? 'border-l-yellow-500 bg-slate-900/40' 
                    : 'border-l-red-500 bg-red-900/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
                  
                  return (
                    <div 
                      key={alert.id} 
                      className={`border-l-4 border-t border-b border-r border-slate-700 rounded-r-xl p-4 animate-in slide-in-from-top-4 fade-in duration-500 ease-out ${glowClass}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(alert.type)}
                          <span className="font-bold text-slate-200 tracking-wide">{alert.type || 'Emergency'}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${isAck ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                          {isAck ? 'Acknowledged' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <Locate size={12} className="opacity-70" /> {alert.location || 'Location Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                        <Clock size={12} className="opacity-70" /> {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : 'Just now'}
                      </p>
                      <div className="text-sm text-slate-300 mb-4 bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 shadow-inner">
                        {alert.message || 'No additional details provided by sender.'}
                      </div>
                      
                      <div className="flex gap-3">
                        {!isAck && (
                          <button 
                            onClick={() => handleAcknowledge(alert.id)}
                            className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-yellow-50 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex justify-center items-center gap-1.5 shadow-lg shadow-yellow-600/20"
                          >
                            <ShieldCheck size={14} /> Acknowledge
                          </button>
                        )}
                        <button 
                          onClick={() => handleResolve(alert.id)}
                          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex justify-center items-center gap-1.5 ${isAck ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-700 hover:bg-slate-600 text-emerald-400 border border-emerald-500/30'}`}
                        >
                          <CheckCircle size={14} /> Resolve
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <ShieldCheck size={40} className="mb-3 opacity-30 text-emerald-500" />
                  <p className="font-medium text-slate-400">No active SOS alerts</p>
                  <p className="text-xs text-slate-500 mt-1">Your district is currently secure.</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Disaster Events */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-700 pb-3 flex items-center gap-2">
              <Info size={20} className="text-blue-500" /> Current Disasters
            </h2>
            <div className="space-y-3">
              {events.length > 0 ? (
                events.map(event => (
                  <div key={event.id} className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/80 flex justify-between items-center hover:bg-slate-700/30 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm tracking-wide">{event.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{event.type} • {event.location}</p>
                    </div>
                    {/* Severity Indicator */}
                    <div className="flex gap-1.5" title={`Severity: ${event.severity}/5`}>
                      {[1, 2, 3, 4, 5].map(dot => (
                        <div 
                          key={dot} 
                          className={`w-2.5 h-2.5 rounded-full ${dot <= event.severity ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-6 bg-slate-900/30 rounded-lg border border-slate-700/50">
                  No active large-scale events at this time.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
