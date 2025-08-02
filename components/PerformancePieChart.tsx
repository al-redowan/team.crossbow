
import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { TournamentData } from '../types';

interface PerformancePieChartProps {
  data: TournamentData[];
}

const COLORS = {
  Win: '#22d3ee', // cyber-neon-blue
  Lose: '#ec4899', // cyber-neon-pink
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-cyber-bg/80 backdrop-blur-sm border border-cyber-border p-3 rounded-lg text-sm">
        <p className="font-bold text-cyber-text-primary">{`${data.name}: ${data.value} (${(data.percent * 100).toFixed(0)}%)`}</p>
      </div>
    );
  }
  return null;
};

const PerformancePieChart: React.FC<PerformancePieChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const wins = data.filter(d => d.winOrLose === 'Win').length;
    const losses = data.filter(d => d.winOrLose === 'Lose').length;
    return [
      { name: 'Win', value: wins },
      { name: 'Lose', value: losses },
    ];
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" wrapperStyle={{fontSize: "14px", bottom: "-10px"}} />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="80%"
          fill="#8884d8"
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PerformancePieChart;
