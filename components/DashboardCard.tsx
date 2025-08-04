import React from 'react';
import { DragHandleIcon } from './IconComponents';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isDraggable?: boolean;
}
interface HeaderProps {
  onSync: () => void;
  lastUpdated: Date | null;
  isLoading: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '', isDraggable = false }) => {
  return (
    <div
      className={`bg-cyber-surface backdrop-blur-md border border-cyber-border rounded-lg shadow-2xl shadow-black/20 h-full flex flex-col transition-all duration-300 hover:border-cyber-neon-blue/50 ${className}`}
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

const DashboardHeader: React.FC<HeaderProps> = ({ onSync, lastUpdated, isLoading }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b-2 border-fuchsia-500/30">
      <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] mb-4 sm:mb-0">
        Cyberpunk E-Sports Dashboard
      </h1>
      <div className="flex items-center space-x-4">
        {lastUpdated && (
          <p className="text-xs text-gray-400 hidden md:block">
            Last Updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
        <button
          onClick={onSync}
          disabled={isLoading}
          className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-200 rounded-lg group bg-gradient-to-br from-cyan-500 to-fuchsia-500 group-hover:from-cyan-500 group-hover:to-fuchsia-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-cyan-800 disabled:cursor-not-allowed"
        >
          <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-gray-900/80 rounded-md group-hover:bg-opacity-0 flex items-center">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              'Sync Now'
            )}
          </span>
        </button>
      </div>
    </header>
  );
};

export { DashboardHeader };
export default DashboardCard;
