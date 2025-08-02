
export interface TournamentData {
  date: Date;
  time: string;
  tournamentName: string;
  teamSlot: string;
  entryFee: number;
  prizepool: number;
  qualifying: string;
  point: number;
  position: number;
  winOrLose: 'Win' | 'Lose' | 'N/A';
  winningPrize: number;
}

export interface Widget {
  id: string;
  title: string;
  component: React.ReactNode;
  colSpan: number;
}
