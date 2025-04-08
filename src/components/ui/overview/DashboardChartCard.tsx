import { PeriodValue } from "@/app/(main)/overview/page";
import { BarChartVariant } from "@/components/BarChartVariant";
import { AvailableChartColorsKeys } from "@/lib/chartUtils";
import { cx } from "@/lib/utils";
import React from "react";
import { DateRange } from "react-day-picker";

type ChartDataPoint = {
  date: string;
  totalPigs?: number; // Optional for heat and fertility charts
  totalPigsInHeat?: number; // Optional for heat and fertility charts
  totalPigsReadyToBreed?: number; // Optional for heat and fertility charts
  // Heat status properties
  open?: number;
  bred?: number;
  pregnant?: number;
  farrowing?: number;
  weaning?: number;
  // Fertility status properties
  inHeat?: number;
  preHeat?: number;
  readyToBreed?: number;
};

export type CardProps = {
  title: string;
  type: "currency" | "unit";
  selectedDates: DateRange | undefined;
  selectedPeriod: PeriodValue;
  data: ChartDataPoint[]; // Time-series data passed from parent
  categories?: string[]; // Dynamic categories for the chart
  colors?: AvailableChartColorsKeys[]; // Dynamic colors for the chart
};

const formattingMap = {
  currency: (value: number) => `$${value}`,
  unit: (value: number) => `${value}`,
};

export const ChartCard = React.memo(function ChartCard({
  title,
  type,
  selectedDates,
  selectedPeriod,
  data, // Time-series data passed from parent
  categories = ["totalPigs", "totalPigsInHeat", "totalPigsReadyToBreed"], // Default categories
  colors = ["blue", "emerald", "violet", "amber", "gray"], // Default colors
}: CardProps) {
  const formatter = formattingMap[type];

  // Filter data based on selected dates
  const filteredData = React.useMemo(() => {
    if (!selectedDates?.from || !selectedDates?.to) return [];

    return data.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate >= selectedDates.from && entryDate <= selectedDates.to
      );
    });
  }, [data, selectedDates]);

  // Determine the value to display in the card header
  const headerValue = React.useMemo(() => {
    if (filteredData.length === 0) return 0;

    const lastEntry = filteredData[filteredData.length - 1];

    // Use the first category as the default value
    const defaultCategory = categories[0];
    return lastEntry[defaultCategory as keyof ChartDataPoint] || 0;
  }, [filteredData, categories]);

  // If no data, display a placeholder
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className={cx("transition hover:opacity-80 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800")}>
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
              {title}
            </dt>
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <dd className="text-xl text-gray-900 dark:text-gray-50">
            0
          </dd>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No monitoring data available</p>
            <p className="text-xs text-gray-400">
              {title === "Total Pigs" ? "Add pigs to see metrics" :
                title === "Heat Status" ? "Add pigs with heat data to see metrics" :
                  title === "Fertility Status" ? "Add pigs with fertility data to see metrics" :
                    "Add data to see metrics"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("transition hover:opacity-80")}>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2">
          <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
            {title}
          </dt>
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <dd className="text-xl text-gray-900 dark:text-gray-50">
          {formatter(headerValue)}
        </dd>
      </div>
      <BarChartVariant
        data={filteredData}
        index="date"
        categories={categories} // Dynamic categories
        colors={["blue", "violet", "gray", "violet", "blue", "gray"]} // Dynamic colors
        valueFormatter={formatter}
        xValueFormatter={(value) => value}
        showXAxis={true}
        showYAxis={true}
        showGridLines={true}
        showTooltip={true}
        showLegend={false}
        autoMinValue={false}
        enableLegendSlider={false}
        legendPosition="right"
        layout="vertical"
      />
    </div>
  );
});