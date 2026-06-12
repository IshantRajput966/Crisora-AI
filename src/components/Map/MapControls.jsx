import React from 'react';
import { Siren, Map as MapIcon } from 'lucide-react';

const MapControls = ({ showSOS, setShowSOS, showRegions, setShowRegions }) => {
  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
      <button 
        onClick={() => setShowRegions(!showRegions)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-colors border ${
          showRegions 
            ? 'bg-slate-800 text-slate-200 border-slate-600' 
            : 'bg-slate-900/80 text-slate-500 border-slate-700'
        }`}
      >
        <MapIcon size={16} />
        <span className="text-sm font-medium">Risk Regions</span>
      </button>
      
      <button 
        onClick={() => setShowSOS(!showSOS)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-colors border ${
          showSOS 
            ? 'bg-red-900/90 text-red-100 border-red-700' 
            : 'bg-slate-900/80 text-slate-500 border-slate-700'
        }`}
      >
        <Siren size={16} />
        <span className="text-sm font-medium">SOS Alerts</span>
      </button>
    </div>
  );
};

export default MapControls;
