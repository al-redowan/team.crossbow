import React from 'react';
import type { TournamentData } from '../types';
import { TrophyIcon, DollarSignIcon, HashIcon } from './IconComponents';

interface TournamentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: TournamentData | null;
}

const DetailRow: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-3 border-b border-cyber-border/30">
    <div className="flex items-center gap-3">
      {icon && <span className="text-cyber-neon-blue">{icon}</span>}
      <span className="text-cyber-text-secondary">{label}</span>
    </div>
    <span className="font-bold text-cyber-text-primary text-right">{value}</span>
  </div>
);

const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({ isOpen, onClose, tournament }) => {
  if (!isOpen || !tournament) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-cyber-surface border border-cyber-border rounded-xl shadow-2xl shadow-cyber-neon-blue/10 w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-cyber-border">
          <div>
            <h2 className="text-xl font-bold text-cyber-text-primary truncate pr-4">{tournament.tournamentName}</h2>
            <p className="text-sm text-cyber-text-secondary">{tournament.date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {tournament.time}</p>
          </div>
          <button onClick={onClose} className="text-3xl text-cyber-text-secondary hover:text-cyber-neon-pink transition-colors flex-shrink-0">&times;</button>
        </header>
        
        <div className="p-6 overflow-y-auto text-sm">
          <DetailRow label="Final Position" value={tournament.position > 0 ? `#${tournament.position}` : 'N/A'} icon={<TrophyIcon />} />
          <DetailRow label="Result" value={tournament.winOrLose} />
          <DetailRow label="Points Scored" value={tournament.point > 0 ? tournament.point : 'N/A'} icon={<HashIcon />} />
          <DetailRow label="Qualifying Status" value={tournament.qualifying} />
          
          <h3 className="text-lg font-bold text-cyber-neon-pink mt-6 mb-2">Financials</h3>
          <DetailRow label="Winnings" value={`৳${tournament.winningPrize.toLocaleString()}`} icon={<DollarSignIcon />} />
          <DetailRow label="Entry Fee" value={`৳${tournament.entryFee.toLocaleString()}`} />
          <DetailRow label="Prizepool" value={`৳${tournament.prizepool.toLocaleString()}`} />
          
          <h3 className="text-lg font-bold text-cyber-neon-pink mt-6 mb-2">Event Info</h3>
          <DetailRow label="Team Slot" value={tournament.teamSlot} />
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailModal;
