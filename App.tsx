import React, { useState, useEffect, useMemo } from 'react';
import type { TournamentData, Widget } from './types';
import { fetchTournamentData } from './services/googleSheetsService';
import { analyzeTournamentData } from './services/aiService';
import KpiCard from './components/KpiCard';
import DashboardCard from './components/DashboardCard';
import DashboardCard, { DashboardHeader } from './components//DashboardCard';
import RevenueChart from './components/RevenueChart';
import PerformancePieChart from './components/PerformancePieChart';
import PositionDistributionBarChart from './components/PositionDistributionBarChart';
import RecentTournamentsTable from './components/RecentTournamentsTable';
import LoadingSpinner from './components/LoadingSpinner';
import AiAnalysisModal from './components/AiAnalysisModal';
import TournamentDetailModal from './components/TournamentDetailModal';
import PerformanceTimelineChart from './components/PerformanceTimelineChart';
import { TrophyIcon, DollarSignIcon, BarChartIcon, HashIcon, ReceiptIcon, NetProfitIcon, RoiIcon, TimelineIcon } from './components/IconComponents';

type FilterType = 'all' | '7d' | '30d';

const App: React.FC = () => {
  const [data, setData] = useState<TournamentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTournament, setSelectedTournament] = useState<TournamentData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedData = await fetchTournamentData();
        setData(fetchedData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredData = useMemo(() => {
    if (filter === 'all') {
      return data;
    }
    const now = new Date();
    const daysToSubtract = filter === '7d' ? 7 : 30;
    // Create a new date object to avoid mutating `now`
    const cutoffDate = new Date(new Date().setDate(now.getDate() - daysToSubtract));
    return data.filter(d => d.date >= cutoffDate);
  }, [data, filter]);
  
  const handleAnalysis = async () => {
    setIsModalOpen(true);
    setIsAnalyzing(true);
    setAiAnalysisResult(null);
    try {
      // AI analysis should always use the full dataset for a complete picture
      const result = await analyzeTournamentData(data);
      setAiAnalysisResult(result);
    } catch (error) {
      setAiAnalysisResult('Failed to get analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
   const { data: parsedResult } = Papa.parse<RawDataRow>(csvText, {
      DashboardHeader: true,
      skipEmptyLines: true,
      transformHeader: DashboardHeader => DashboardHeader.trim(),
    });

  const initialWidgets: Widget[] = useMemo(() => [
    { id: 'revenue', title: 'Revenue & Prize Trends', component: <RevenueChart data={filteredData} />, colSpan: 2 },
    { id: 'performance', title: 'Win / Loss Performance', component: <PerformancePieChart data={filteredData} />, colSpan: 1 },
    { id: 'timeline', title: 'Performance Timeline (Avg. Position)', component: <PerformanceTimelineChart data={filteredData} />, colSpan: 2 },
    { id: 'positions', title: 'Position Distribution', component: <PositionDistributionBarChart data={filteredData} />, colSpan: 1 },
    { id: 'recent', title: 'Recent Tournaments', component: <RecentTournamentsTable data={filteredData} onRowClick={setSelectedTournament} />, colSpan: 3 }
  ], [filteredData]);

  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  
  useEffect(() => {
      setWidgets(initialWidgets);
  }, [initialWidgets]);


  const kpiData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { totalWinnings: 0, winRate: 0, totalTournaments: 0, avgPosition: 0, totalEntryFee: 0, netProfit: 0, roi: 0 };
    }
    const totalWinnings = filteredData.reduce((acc, curr) => acc + curr.winningPrize, 0);
    const totalEntryFee = filteredData.reduce((acc, curr) => acc + curr.entryFee, 0);
    const wins = filteredData.filter(d => d.winOrLose === 'Win').length;
    const totalGames = filteredData.length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const positionData = filteredData.filter(d => d.position > 0);
    const totalPosition = positionData.reduce((acc, curr) => acc + curr.position, 0);
    const avgPosition = positionData.length > 0 ? totalPosition / positionData.length : 0;
    const netProfit = totalWinnings - totalEntryFee;
    const roi = totalEntryFee > 0 ? (netProfit / totalEntryFee) * 100 : 0;
    
    return { totalWinnings, totalEntryFee, winRate, totalTournaments: totalGames, avgPosition, netProfit, roi };
  }, [filteredData]);
  
  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      (e.target as HTMLElement).style.opacity = '1';
      setDraggedWidgetId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropTargetId: string) => {
    e.preventDefault();
    if (draggedWidgetId === null || draggedWidgetId === dropTargetId) {
        return;
    }

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidgetId);
    const dropIndex = widgets.findIndex(w => w.id === dropTargetId);
    
    const newWidgets = [...widgets];
    const [draggedItem] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(dropIndex, 0, draggedItem);

    setWidgets(newWidgets);
    setDraggedWidgetId(null);
  };
  
  const getColSpanClass = (span: number) => {
    if (span === 2) return 'lg:col-span-2';
    if (span === 3) return 'lg:col-span-3';
    return '';
  };

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center bg-cyber-bg"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-cyber-bg p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Fetching Data</h1>
        <p className="text-cyber-text-secondary text-center">{error}</p>
        <p className="mt-4 text-sm text-gray-500">Please ensure the Google Sheets link is public and accessible.</p>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-cyber-bg p-4 sm:p-6 lg:p-8 font-sans">
        <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at top left, #22d3ee 0%, transparent 30%), radial-gradient(circle at bottom right, #ec4899 0%, transparent 40%)'}}></div>
        <div className="relative z-10">
          <header className="mb-8 animate-fade-in flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-cyber-text-primary tracking-wider">Team Crossbow: Performance Hub</h1>
              <p className="text-cyber-text-secondary mt-1">Free Fire Tournament Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-cyber-surface border border-cyber-border rounded-lg p-1">
                {(['All Time', '30d', '7d'] as const).map(f => {
                    const filterId = f === 'All Time' ? 'all' : f;
                    return (
                        <button key={filterId} onClick={() => setFilter(filterId)} className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${filter === filterId ? 'bg-cyber-neon-blue text-cyber-bg' : 'text-cyber-text-secondary hover:text-cyber-text-primary'}`}>
                            {f}
                        </button>
                    )
                })}
              </div>
              <button onClick={handleAnalysis} disabled={isAnalyzing} className="px-4 py-2 rounded-lg bg-cyber-neon-blue/20 text-cyber-neon-blue border border-cyber-neon-blue/50 font-bold transition-all duration-300 hover:bg-cyber-neon-blue/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              </button>
              </div>
            <div className="min-h-screen text-gray-200 p-4 sm:p-6 lg:p-8 font-orbitron">
      <DashboardHeader onSync={fetchData} lastUpdated={lastUpdated} isLoading={isLoading} />
      
      {error && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-red-900/50 border border-red-500 p-8 rounded-lg text-center backdrop-blur-sm">
            <h2 className="text-2xl text-red-400 mb-4">Error</h2>
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="mt-6 px-4 py-2 bg-red-500/50 hover:bg-red-500 text-white rounded-md border border-red-400 transition-all duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}
          </Header>

          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-6 animate-slide-in" style={{animationDelay: '100ms'}}>
            <KpiCard title="Total Winnings" value={`৳${kpiData.totalWinnings.toLocaleString()}`} icon={<DollarSignIcon />} />
            <KpiCard title="Total Cost" value={`৳${kpiData.totalEntryFee.toLocaleString()}`} icon={<ReceiptIcon />} color="pink" />
            <KpiCard title="Net Profit" value={`৳${kpiData.netProfit.toLocaleString()}`} icon={<NetProfitIcon />} color={kpiData.netProfit >= 0 ? 'blue' : 'pink'} />
            <KpiCard title="Win Rate" value={`${kpiData.winRate.toFixed(1)}%`} icon={<TrophyIcon />} />
            <KpiCard title="ROI" value={`${kpiData.roi.toFixed(1)}%`} icon={<RoiIcon />} color={kpiData.roi >= 0 ? 'blue' : 'pink'} />
            <KpiCard title="Avg. Position" value={kpiData.avgPosition > 0 ? `#${kpiData.avgPosition.toFixed(1)}` : 'N/A'} icon={<HashIcon />} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {widgets.map((widget, index) => (
               <div
                key={widget.id}
                draggable
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, widget.id)}
                className={`animate-slide-in ${getColSpanClass(widget.colSpan)} transition-opacity duration-300`}
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <DashboardCard title={widget.title} isDraggable={true}>
                  {widget.component}
                </DashboardCard>
              </div>
            ))}
          </section>
        </div>
      </main>
      <AiAnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isLoading={isAnalyzing} analysis={aiAnalysisResult} />
      <TournamentDetailModal isOpen={!!selectedTournament} onClose={() => setSelectedTournament(null)} tournament={selectedTournament} />
         </>
  );
};

export default App;

      
