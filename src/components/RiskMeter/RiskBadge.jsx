import React from 'react';

const RiskBadge = ({ level }) => {
  const badgeStyles = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const style = badgeStyles[level] || badgeStyles.green;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} uppercase tracking-wider`}>
      {level}
    </span>
  );
};

export default RiskBadge;
