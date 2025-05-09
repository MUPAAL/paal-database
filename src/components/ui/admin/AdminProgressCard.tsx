import { Badge } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";

export type AdminMetricItem = {
  title: string;
  current: number;
  allowed: number;
  percentage: number;
  unit?: string;
};

export type AdminCardProps = {
  title: string;
  change?: string;
  value: string | number;
  valueDescription: string;
  ctaDescription?: string;
  ctaText?: string;
  ctaLink?: string;
  data: AdminMetricItem[];
  icon?: React.ReactNode;
};

export function AdminProgressCard({
  title,
  change,
  value,
  valueDescription,
  ctaDescription,
  ctaText,
  ctaLink,
  data,
  icon,
}: AdminCardProps) {
  // Check if there's no data or all metrics are zero
  const isEmpty = !data || data.length === 0 || data.every(item => item.current === 0);

  if (isEmpty) {
    return (
      <div className="flex flex-col justify-between bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                {title}
              </dt>
              {change && <Badge variant="neutral">{change}</Badge>}
            </div>
            {icon && (
              <div className="bg-gray-100 p-3 rounded-full dark:bg-gray-800">
                {icon}
              </div>
            )}
          </div>
          <dd className="mt-2 flex items-baseline gap-2">
            <span className="text-xl text-gray-900 dark:text-gray-50">
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
                <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400">
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
    <div className="flex flex-col justify-between bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
              {title}
            </dt>
            {change && <Badge variant="neutral">{change}</Badge>}
          </div>
          {icon && (
            <div className="bg-gray-100 p-3 rounded-full dark:bg-gray-800">
              {icon}
            </div>
          )}
        </div>
        <dd className="mt-2 flex items-baseline gap-2">
          <span className="text-xl text-gray-900 dark:text-gray-50">
            {value}
          </span>
          <span className="text-sm text-gray-500">{valueDescription}</span>
        </dd>
        <ul role="list" className="mt-4 space-y-3">
          {data.map((item) => (
            <li key={item.title}>
              <p className="flex justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {item.title}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {item.current}
                  <span className="font-normal text-gray-500">
                    {item.allowed ? `/${item.allowed}` : ''}
                    {item.unit || ''}
                  </span>
                </span>
              </p>
              <ProgressBar
                value={item.percentage}
                className="mt-2 [&>*]:h-1.5"
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
              <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400">
                {ctaText}
              </a>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
