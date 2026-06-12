import React from 'react';
import { Siren } from 'lucide-react';

const SOSButton = () => {
  return (
    <button className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg font-bold shadow-red-600/30 transition-all active:scale-95">
      <Siren size={20} className="animate-pulse" />
      <span>EMERGENCY SOS</span>
    </button>
  );
};

export default SOSButton;
