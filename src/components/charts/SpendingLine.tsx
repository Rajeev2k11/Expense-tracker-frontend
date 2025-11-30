import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg backdrop-blur-sm">
        <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-sm text-gray-600">
          Amount: <span className="font-bold text-blue-600">${payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpendingLine: React.FC<{ data: { date: string; value: number }[] | any }> = ({ data }) => {
  const safeData: { date: string; value: number }[] = Array.isArray(data) ? data : [];
  if (!Array.isArray(data)) console.warn('SpendingLine received non-array data:', data);

  // Calculate min and max for better YAxis scaling
  const values = safeData.map(item => item.value);
  const dataMax = Math.max(...values);
  const dataMin = Math.min(...values);
  const yAxisPadding = (dataMax - dataMin) * 0.1; // 10% padding

  if (safeData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50/50 rounded-lg border border-gray-200">
        <div className="text-center p-6">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-400 text-sm font-medium">No spending data available</p>
          <p className="text-gray-400 text-xs mt-1">Add some transactions to see your spending trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <ResponsiveContainer width="100%" height="100%" debounce={200}>
        <LineChart 
          data={safeData} 
          margin={{ 
            top: 15, 
            right: 20, 
            left: 10, 
            bottom: 15 
          }}
        >
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="2 4" 
            stroke="#f1f5f9" 
            vertical={false}
            strokeOpacity={0.6}
          />
          
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
            padding={{ left: 5, right: 5 }}
            interval="preserveStartEnd"
            minTickGap={15}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
            width={45}
            tickFormatter={(value) => `$${value}`}
            domain={[dataMin - yAxisPadding, dataMax + yAxisPadding]}
            tickCount={6}
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{
              stroke: '#e2e8f0',
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
          />
          
          {/* Area under the line */}
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="transparent" 
            fill="url(#spendingGradient)" 
            fillOpacity={0.6}
          />
          
          {/* Main line */}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{ 
              fill: 'white', 
              stroke: '#3B82F6', 
              strokeWidth: 2, 
              r: 4,
              opacity: 0.8
            }}
            activeDot={{ 
              r: 6, 
              fill: 'white', 
              stroke: '#3B82F6', 
              strokeWidth: 3,
              style: { filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))' }
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Chart footer with summary */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {safeData.length} data points
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default SpendingLine;