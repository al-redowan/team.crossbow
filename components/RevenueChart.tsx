
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import type { TournamentData } from '../types';

interface RevenueChartProps {
  data: TournamentData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cyber-bg/80 backdrop-blur-sm border border-cyber-border p-3 rounded-lg text-sm">
        <p className="label font-bold text-cyber-text-primary">{label}</p>
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.color }}>
            {`${pld.name}: ৳${pld.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = data.map(d => ({
    name: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Entry Fee': d.entryFee,
    'Prizepool': d.prizepool,
    'Winning Prize': d.winningPrize
  })).reverse(); // Show oldest first

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${Number(value) / 1000}k`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)'}} />
        <Legend wrapperStyle={{fontSize: "14px"}} />
        <Line type="monotone" dataKey="Entry Fee" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="Prizepool" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="Winning Prize" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }}/>
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
