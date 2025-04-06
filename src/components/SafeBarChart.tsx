import React from 'react';
import { BarChart, BarChartEventProps } from './BarChart';

interface SafeBarChartProps {
  data: Record<string, any>[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  [key: string]: any;
}

/**
 * A wrapper around BarChart that handles NaN and undefined values
 */
const SafeBarChart: React.FC<SafeBarChartProps> = ({
  data,
  index,
  categories,
  ...props
}) => {
  // Filter out any data points with NaN or undefined values
  const safeData = data.map(item => {
    const newItem = { ...item };
    categories.forEach(key => {
      if (newItem[key] === undefined || isNaN(newItem[key])) {
        newItem[key] = 0; // Replace NaN or undefined with 0
      }
    });
    return newItem;
  });

  return (
    <BarChart
      data={safeData}
      index={index}
      categories={categories}
      {...props}
    />
  );
};

export default SafeBarChart;
