import React from 'react';
import type { TournamentData } from '../types';

interface RecentTournamentsTableProps {
  data: TournamentData[];
  onRowClick: (tournament: TournamentData) => void;
}

const RecentTournamentsTable: React.FC<RecentTournamentsTableProps> = ({ data, onRowClick }) => {
  const recentData = data.slice(0, 8); // Show top 8 most recent

  return (
    <div className="overflow-y-auto h-full pr-2">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-cyber-text-secondary uppercase">
          <tr>
            <th scope="col" className="pb-3">Tournament</th>
            <th scope="col" className="pb-3 text-center">Pos.</th>
            <th scope="col" className="pb-3 text-right">Fee</th>
            <th scope="col" className="pb-3 text-right">Winnings</th>
          </tr>
        </thead>
        <tbody>
          {recentData.map((item, index) => (
            <tr 
              key={index} 
              className="border-b border-cyber-border/50 hover:bg-cyber-border/20 transition-colors cursor-pointer"
              onClick={() => onRowClick(item)}
            >
              <td className="py-3 font-medium text-cyber-text-primary whitespace-nowrap">
                <div className="truncate w-40 sm:w-auto">{item.tournamentName}</div>
                <div className="text-xs text-cyber-text-secondary">{item.date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
              </td>
              <td className={`py-3 text-center font-bold text-base ${item.position > 0 && item.position <= 3 ? 'text-cyber-neon-blue' : 'text-cyber-text-primary'}`}>
                {item.position > 0 ? item.position : '-'}
              </td>
              <td className="py-3 text-right font-medium text-cyber-text-secondary">
                ৳{item.entryFee.toLocaleString()}
              </td>
              <td className="py-3 text-right font-medium text-cyber-neon-green">
                ৳{item.winningPrize.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTournamentsTable;