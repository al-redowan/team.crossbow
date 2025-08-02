import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: 'blue' | 'pink';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      border: 'hover:border-cyber-neon-blue/50',
      iconBg: 'bg-cyber-neon-blue/10',
      iconText: 'text-cyber-neon-blue',
      shadow: 'hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]',
    },
    pink: {
      border: 'hover:border-cyber-neon-pink/50',
      iconBg: 'bg-cyber-neon-pink/10',
      iconText: 'text-cyber-neon-pink',
      shadow: 'hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]',
    },
  };

  const selectedColor = colorClasses[color];

  return (
    <div className={`bg-cyber-surface backdrop-blur-md border border-cyber-border rounded-lg p-5 shadow-lg shadow-black/20 transition-all duration-300 ${selectedColor.border} ${selectedColor.shadow} hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-cyber-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-cyber-text-primary">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${selectedColor.iconBg} ${selectedColor.iconText}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;