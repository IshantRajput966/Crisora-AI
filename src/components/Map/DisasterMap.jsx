import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair } from 'lucide-react';
import { RiskBadge } from '../RiskMeter';
import MapControls from './MapControls';

// Fix for default icons if needed elsewhere in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map locate functionality
const LocateControl = () => {
  const map = useMap();
  
  useEffect(() => {
    map.on('locationfound', (e) => {
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return (
    <button 
      onClick={() => map.locate()}
      className="absolute top-4 right-4 z-[1000] p-2 bg-slate-800 text-slate-200 rounded-lg shadow-lg border border-slate-700 hover:bg-slate-700 transition"
      title="Locate Me"
    >
      <Crosshair size={20} />
    </button>
  );
};

const getLevelColor = (level) => {
  switch (level) {
    case 'green': return '#16a34a';
    case 'yellow': return '#ca8a04';
    case 'orange': return '#ea580c';
    case 'red': return '#dc2626';
    default: return '#16a34a';
  }
};

const DisasterMap = ({ regions = [], sosAlerts = [], center = [20.5937, 78.9629], zoom = 5 }) => {
  const [showSOS, setShowSOS] = useState(true);
  const [showRegions, setShowRegions] = useState(true);

  // Custom pulsing icon for SOS alerts
  const createPulseIcon = () => L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div class="relative flex h-6 w-6 items-center justify-center">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
             <span class="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-700">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <LocateControl />
        
        {showRegions && regions.map((region, idx) => {
          if (!region.geojson) return null;
          return (
            <GeoJSON 
              key={region.id || idx}
              data={region.geojson}
              pathOptions={{ 
                color: getLevelColor(region.riskLevel), 
                fillColor: getLevelColor(region.riskLevel), 
                fillOpacity: 0.4,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <h3 className="font-bold text-lg mb-2 text-slate-800">{region.name}</h3>
                  <div className="mb-2">
                    <RiskBadge level={region.riskLevel} />
                  </div>
                  <p className="text-sm text-slate-600">
                    Population: {region.population ? region.population.toLocaleString() : 'N/A'}
                  </p>
                </div>
              </Popup>
            </GeoJSON>
          );
        })}

        {showSOS && sosAlerts.map((alert, idx) => (
          <Marker 
            key={alert.id || idx}
            position={[alert.lat, alert.lng]}
            icon={createPulseIcon()}
          >
             <Popup>
               <div className="p-1 min-w-[150px]">
                 <h4 className="font-bold text-red-600 mb-1">SOS Alert</h4>
                 <p className="text-sm text-slate-700">{alert.message || 'Emergency assistance needed!'}</p>
                 {alert.phone && <p className="text-xs text-slate-500 mt-1">{alert.phone}</p>}
               </div>
             </Popup>
          </Marker>
        ))}
      </MapContainer>

      <MapControls 
        showSOS={showSOS} setShowSOS={setShowSOS} 
        showRegions={showRegions} setShowRegions={setShowRegions} 
      />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-800/90 border border-slate-700 p-3 rounded-lg shadow-lg backdrop-blur-sm pointer-events-none">
        <h4 className="text-xs font-semibold text-slate-300 uppercase mb-2">Risk Levels</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600"></span><span className="text-xs text-slate-200">Red (Critical)</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-600"></span><span className="text-xs text-slate-200">Orange (High)</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-600"></span><span className="text-xs text-slate-200">Yellow (Moderate)</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-600"></span><span className="text-xs text-slate-200">Green (Low)</span></div>
        </div>
      </div>
    </div>
  );
};

export default DisasterMap;
