import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { TournamentData, Widget } from './types';
import { fetchTournamentData } from './services/googleSheetsService';
import { analyzeTournamentData } from './services/aiService';
import KpiCard from './components/KpiCard';
import DashboardCard from './components/DashboardCard';
import RevenueChart from './components/RevenueChart';
import PerformancePieChart from './components/PerformancePieChart';
import PositionDistributionBarChart from './components/PositionDistributionBarChart';
import RecentTournamentsTable from './components/RecentTournamentsTable';
import LoadingSpinner from './components/LoadingSpinner';
import AiAnalysisModal from './components/AiAnalysisModal';
import TournamentDetailModal from './components/TournamentDetailModal';
import PerformanceTimelineChart from './components/PerformanceTimelineChart';
import { TrophyIcon, DollarSignIcon, BarChartIcon, HashIcon, ReceiptIcon, NetProfitIcon, RoiIcon, TimelineIcon } from './components/IconComponents';
import Header from './components/Header'; // Ensure Header is imported

// Assuming these components are defined elsewhere and imported correctly
// import EngagementChart from './components/EngagementChart';
// import ConversionFunnel from './components/ConversionFunnel';

type FilterType = 'all' | '7d' | '30d';

const App: React.FC = () => {
  const [data, setData] = useState<TournamentData[]>([]);
  // `loading` state is used for the initial page load spinner.
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // `isLoadingSync` state specifically for the "Sync Now" button's loading indicator.
  const [isLoadingSync, setIsLoadingSync] = useState<boolean>(false);
  // `lastUpdated` state to display the last sync time.
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTournament, setSelectedTournament] = useState<TournamentData | null>(null);

  // Function to fetch data, memoized for performance.
  const fetchData = useCallback(async () => {
    setIsLoadingSync(true); // Activate sync loading indicator
    setError(null); // Clear any previous errors
    try {
      const fetchedData = await fetchTournamentData();
      setData(fetchedData);
      setLastUpdated(new Date()); // Update last updated time on successful fetch
      setLoading(false); // Ensure the general loading state is false after data is fetched
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false); // Ensure the general loading state is false even on error
    } finally {
      setIsLoadingSync(false); // Deactivate sync loading indicator
    }
  }, []); // Dependencies are empty as it only uses setters and external service functions.

  // Effect to fetch data on component mount.
  useEffect(() => {
    fetchData();
    // If an interval sync is desired, REFRESH_INTERVAL should be defined and used here.
  }, [fetchData]); // fetchData is a dependency.

  const filteredData = useMemo(() => {
    if (filter === 'all') {
      return data;
    }
    const now = new Date();
    const daysToSubtract = filter === '7d' ? 7 : 30;
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

  // Define initial widgets configuration
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

  // Calculate KPI data based on filtered data.
  const kpiData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        totalWinnings: 0,
        totalEntryFee: 0,
        winRate: 0,
        totalTournaments: 0,
        avgPosition: 0,
        netProfit: 0,
        roi: 0,
        // KPIs used in the first KPI section of the JSX
        totalRevenue: 0,
        avgWinRate: 0,
        totalMatches: 0,
        avgDau: 0 // This KPI is not directly calculated from tournament data
      };
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

    // Map to the specific KPI names used in the JSX
    const totalRevenue = totalWinnings;
    const avgWinRate = winRate;
    const totalMatches = totalGames;
    const avgDau = 0; // Placeholder, as avgDau is not derived from tournament data.

    return { totalWinnings, totalEntryFee, winRate, totalTournaments: totalGames, avgPosition, netProfit, roi, totalRevenue, avgWinRate, totalMatches, avgDau };
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

  // Initial loading state for the whole page.
  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center bg-cyber-bg"><LoadingSpinner /></div>;
  }

  // Error state for initial data fetching.
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
    <div className="min-h-screen text-gray-200 p-4 sm:p-6 lg:p-8 font-orbitron">
      {/* Header Component: Pass sync-related states and the fetchData function */}
      <Header onSync={fetchData} lastUpdated={lastUpdated} isLoading={isLoadingSync} />

      {/* Render error overlay if there's an error, with a retry option */}
      {error && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-red-900/50 border border-red-500 p-8 rounded-lg text-center backdrop-blur-sm">
            <h2 className="text-2xl text-red-400 mb-4">Error</h2>
            <p>{error}</p>
            <button
              onClick={fetchData} // Use the memoized fetchData function
              className="mt-6 px-4 py-2 bg-red-500/50 hover:bg-red-500 text-white rounded-md border border-red-400 transition-all duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main dashboard content */}
      {!isLoading && !error && data.length > 0 && (
        <>
          {/* First section of KPIs and charts */}
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {kpiData && (
              <>
                {/* Note: Assuming kpiData has properties like totalRevenue, avgWinRate, totalMatches, avgDau */}
                <KpiCard title="Total Revenue" value={`$${kpiData.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                <KpiCard title="Avg. Win Rate" value={`${kpiData.avgWinRate.toFixed(1)}%`} />
                <KpiCard title="Total Matches" value={kpiData.totalMatches.toLocaleString()} />
                <KpiCard title="Avg. Daily Users" value={kpiData.avgDau.toLocaleString(undefined, {maximumFractionDigits: 0})} />
              </>
            )}

            <div className="md:col-span-2 lg:col-span-4">
              <RevenueChart data={data} /> {/* Using 'data' as per original snippet, adjust if filteredData is intended */}
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              {/* Assuming EngagementChart and ConversionFunnel components exist */}
              {/* <EngagementChart data={data} /> */}
              <div className="bg-gray-800 p-4 rounded-lg h-64 flex items-center justify-center">Engagement Chart Placeholder</div>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              {/* <ConversionFunnel data={data} /> */}
              <div className="bg-gray-800 p-4 rounded-lg h-64 flex items-center justify-center">Conversion Funnel Placeholder</div>
            </div>
          </main>

          {/* Second section with draggable widgets */}
          <div className="relative z-10 mt-6">
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
        </>
      )}

      {/* Message when no data is available after loading */}
      {!isLoading && !error && data.length === 0 && (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="bg-black/50 backdrop-blur-sm border border-cyan-500/30 p-8 rounded-lg text-center">
            <h2 className="text-2xl text-cyan-300 mb-4">No Data to Display</h2>
            <p className="text-gray-400">Could not process any data rows from the Google Sheet.</p>
            <p className="text-gray-400 mt-1">Please ensure the sheet is not empty and has the correct headers.</p>
          </div>
        </div>
      )}

      {/* Modals for AI Analysis and Tournament Details */}
      <AiAnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isLoading={isAnalyzing} analysis={aiAnalysisResult} />
      <TournamentDetailModal isOpen={!!selectedTournament} onClose={() => setSelectedTournament(null)} tournament={selectedTournament} />
    </div>
  );
};

export default App;
