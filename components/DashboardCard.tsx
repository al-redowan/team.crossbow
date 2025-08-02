
import React from 'react';
import { DragHandleIcon } from './IconComponents';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isDraggable?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '', isDraggable = false }) => {
  return (
    <div
      className={`bg-cyber-surface backdrop-blur-md border border-cyber-border rounded-lg shadow-2xl shadow-black/20 h-full flex flex-col transition-all duration-300 hover:border-cyber-neon-blue/50 ${className} ${isDraggable ? 'cursor-grab' : ''}`}
    >
      <header className="flex items-center justify-between p-4 sm:p-6 border-b border-cyber-border/50">
        <h3 className="text-lg font-bold text-cyber-text-primary">{title}</h3>
        {isDraggable && (
          <div className="text-cyber-text-secondary hover:text-cyber-text-primary transition-colors" title="Drag to rearrange">
            <DragHandleIcon />
          </div>
        )}
      </header>
      <div className="p-4 sm:p-6 h-full min-h-[250px]">{children}</div>
    </div>
  );
};

export default DashboardCard;
