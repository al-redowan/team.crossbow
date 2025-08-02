
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import type { TournamentData } from '../types';

interface PositionDistributionBarChartProps {
  data: TournamentData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cyber-bg/80 backdrop-blur-sm border border-cyber-border p-3 rounded-lg text-sm">
        <p className="label font-bold text-cyber-text-primary">{`Position: ${label}`}</p>
        <p style={{ color: payload[0].fill }}>
          {`Count: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

const PositionDistributionBarChart: React.FC<PositionDistributionBarChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const positionCounts: { [key: number]: number } = {};
    data.forEach(d => {
      if (d.position > 0) {
        positionCounts[d.position] = (positionCounts[d.position] || 0) + 1;
      }
    });

    return Object.entries(positionCounts)
      .map(([position, count]) => ({
        name: `P${position}`,
        position: parseInt(position),
        count
      }))
      .sort((a, b) => a.position - b.position);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)'}} />
        <Legend wrapperStyle={{fontSize: "14px"}} />
        <Bar dataKey="count" name="Frequency" fill="#34d399" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PositionDistributionBarChart;
