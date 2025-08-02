import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import type { TournamentData } from '../types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cyber-bg/80 backdrop-blur-sm border border-cyber-border p-3 rounded-lg text-sm">
        <p className="label font-bold text-cyber-text-primary">{label}</p>
        <p style={{ color: payload[0].color }}>
          {`${payload[0].name}: #${payload[0].value.toFixed(2)}`}
        </p>
      </div>
    );
  }
  return null;
};

const PerformanceTimelineChart: React.FC<{ data: TournamentData[] }> = ({ data }) => {
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { totalPosition: number; count: number; date: Date } } = {};
    
    // Reverse data to process from oldest to newest for correct month ordering
    [...data].reverse().forEach(d => {
      if (d.position > 0) {
        const monthYear = d.date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { totalPosition: 0, count: 0, date: new Date(d.date.getFullYear(), d.date.getMonth(), 1) };
        }
        monthlyData[monthYear].totalPosition += d.position;
        monthlyData[monthYear].count++;
      }
    });

    return Object.entries(monthlyData).map(([name, { totalPosition, count }]) => ({
      name,
      'Avg. Position': totalPosition / count,
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis 
          stroke="#9ca3af" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          reversed={true}
          domain={['dataMin - 2', 'dataMax + 2']}
          tickFormatter={(value) => `#${value}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Legend wrapperStyle={{ fontSize: "14px", bottom: "-10px" }} />
        <Line 
          type="monotone" 
          dataKey="Avg. Position" 
          stroke="#34d399" 
          strokeWidth={2} 
          dot={{ r: 3 }} 
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceTimelineChart;
