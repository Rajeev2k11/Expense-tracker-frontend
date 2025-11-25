import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from 'recharts';

const SpendingLine: React.FC<{ data: { date: string; value: number }[] | any }> = ({ data }) => {
  const safeData: { date: string; value: number }[] = Array.isArray(data) ? data : [];
  if (!Array.isArray(data)) console.warn('SpendingLine received non-array data:', data);

  if (safeData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-sm">No spending data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Amount: <span className="font-semibold">${payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={safeData} 
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="spendingGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#374151" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#374151" stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#f3f4f6" 
          vertical={false}
        />
        
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          padding={{ left: 10, right: 10 }}
        />
        
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          width={40}
          tickFormatter={(value) => `$${value}`}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="transparent" 
          fill="url(#spendingGradient)" 
        />
        
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#374151" 
          strokeWidth={2}
          dot={{ fill: '#374151', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#374151', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SpendingLine;