import { Badge } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";
import { ReactNode } from "react";

export type AdminMetricItem = {
  title: string;
  current: number;
  allowed: number;
  percentage: number;
  unit?: string;
};

export type EnhancedAdminCardProps = {
  title: string;
  subtitle?: string;
  change?: string;
  value: string | number;
  valueDescription: string;
  ctaDescription?: string;
  ctaText?: string;
  ctaLink?: string;
  data: AdminMetricItem[];
  icon?: ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "yellow" | "indigo";
  onClick?: () => void;
};

// Helper function to get icon container class based on color
const getIconContainerClass = (color: string = "blue") => {
  const classes = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/60",
    green: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/60",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/60",
    orange: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/60",
    red: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/60",
    yellow: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/60",
    indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/60",
  };
  return `p-3 rounded-xl shadow-md ${classes[color] || classes.blue}`;
};

// Helper function to get icon class based on color
const getIconClass = (color: string = "blue") => {
  const classes = {
    blue: "text-blue-600 dark:text-blue-300",
    green: "text-green-600 dark:text-green-300",
    purple: "text-purple-600 dark:text-purple-300",
    orange: "text-orange-600 dark:text-orange-300",
    red: "text-red-600 dark:text-red-300",
    yellow: "text-yellow-600 dark:text-yellow-300",
    indigo: "text-indigo-600 dark:text-indigo-300",
  };
  return `h-6 w-6 ${classes[color] || classes.blue}`;
};

// Helper function to get progress bar class based on color
const getProgressBarClass = (color: string = "blue") => {
  const classes = {
    blue: "[&>div]:bg-blue-500 dark:[&>div]:bg-blue-600",
    green: "[&>div]:bg-green-500 dark:[&>div]:bg-green-600",
    purple: "[&>div]:bg-purple-500 dark:[&>div]:bg-purple-600",
    orange: "[&>div]:bg-orange-500 dark:[&>div]:bg-orange-600",
    red: "[&>div]:bg-red-500 dark:[&>div]:bg-red-600",
    yellow: "[&>div]:bg-yellow-500 dark:[&>div]:bg-yellow-600",
    indigo: "[&>div]:bg-indigo-500 dark:[&>div]:bg-indigo-600",
  };
  return `mt-2 [&>*]:h-2 rounded-full ${classes[color] || classes.blue}`;
};

export function EnhancedAdminCard({
  title,
  subtitle,
  change,
  value,
  valueDescription,
  ctaDescription,
  ctaText,
  ctaLink,
  data,
  icon,
  color = "blue",
  onClick
}: EnhancedAdminCardProps) {
  // Check if there's no data or all metrics are zero
  const isEmpty = !data || data.length === 0 || data.every(item => item.current === 0);

  if (isEmpty) {
    return (
      <div
        className="flex flex-col justify-between bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
        onClick={onClick}
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                  {title}
                </dt>
                {change && <Badge variant="neutral">{change}</Badge>}
              </div>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {icon && (
              <div className={getIconContainerClass(color)}>
                <div className={getIconClass(color)}>
                  {icon}
                </div>
              </div>
            )}
          </div>
          <dd className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              0
            </span>
            <span className="text-sm text-gray-500">{valueDescription}</span>
          </dd>
          <div className="flex h-24 items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No information available</p>
              <p className="text-xs text-gray-400">Add data to see metrics</p>
            </div>
          </div>
          {(ctaDescription || ctaText) && (
            <p className="mt-4 text-xs text-gray-500">
              {ctaDescription}{" "}
              {ctaLink && ctaText && (
                <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {ctaText}
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col justify-between bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
      onClick={onClick}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                {title}
              </dt>
              {change && <Badge variant="neutral">{change}</Badge>}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={getIconContainerClass(color)}>
              <div className={getIconClass(color)}>
                {icon}
              </div>
            </div>
          )}
        </div>
        <dd className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            {value}
          </span>
          <span className="text-sm text-gray-500">{valueDescription}</span>
        </dd>
        <ul role="list" className="mt-6 space-y-4">
          {data.map((item) => (
            <li key={item.title}>
              <p className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {item.title}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {item.current}
                  <span className="font-normal text-gray-500 ml-1">
                    {item.allowed ? `/${item.allowed}` : ''}
                    {item.unit || ''}
                  </span>
                </span>
              </p>
              <ProgressBar
                value={item.percentage}
                className={getProgressBarClass(color)}
              />
            </li>
          ))}
        </ul>
      </div>
      {(ctaDescription || ctaText) && (
        <div>
          <p className="mt-6 text-xs text-gray-500">
            {ctaDescription}{" "}
            {ctaLink && ctaText && (
              <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400 font-medium">
                {ctaText}
              </a>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
