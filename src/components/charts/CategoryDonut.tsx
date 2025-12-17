import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#4B5563', '#71717A', '#52525B', '#A1A1AA'];

interface DataItem {
  name: string;
  value: number;
}

interface CategoryDonutProps {
  data: DataItem[] | unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DataItem;
    
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-xl rounded-lg min-w-[140px] backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].color }}
          ></div>
          <p className="font-semibold text-gray-900 text-sm">{data.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-600 text-sm">
            Amount: <span className="font-bold">${data.value.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CategoryDonut: React.FC<CategoryDonutProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const safeData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);
  
  if (!Array.isArray(data)) console.warn('CategoryDonut received non-array data:', data);

  const totalValue = useMemo(() => safeData.reduce((sum, item) => sum + item.value, 0), [safeData]);

  if (safeData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p className="text-gray-500 text-sm">No category data available</p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props;
    if (percent < 0.08) return null; // Hide label for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const isActive = activeIndex === index;
    const percentage = (percent * 100).toFixed(0);

    return (
      <g>
        <text 
          x={x} 
          y={y} 
          fill={isActive ? "#111827" : "#374151"}
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          className={`text-xs font-bold transition-all duration-200 ${
            isActive ? 'scale-110' : 'scale-100'
          }`}
          style={{
            textShadow: isActive ? '0 1px 2px rgba(255, 255, 255, 0.8)' : 'none',
            fontSize: isActive ? '11px' : '10px'
          }}
        >
          {`${percentage}%`}
        </text>
      </g>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="flex flex-col gap-2 mt-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload?.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / totalValue) * 100).toFixed(1);
          const isActive = activeIndex === index;
          
          return (
            <div 
              key={`legend-${index}`}
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-gray-100 scale-105' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-700 font-medium">{entry.value}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  ${entry.payload.value.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 w-10 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={safeData} 
            dataKey="value" 
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            label={CustomLabel}
            labelLine={false}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={300}
            animationBegin={0}
          >
            {safeData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#ffffff"
                strokeWidth={activeIndex === index ? 3 : 2}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.7}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  filter: activeIndex === index ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))' : 'none',
                  transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center'
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            content={renderLegend}
            verticalAlign="bottom"
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    
      
    </div>
  );
};

export default CategoryDonut;