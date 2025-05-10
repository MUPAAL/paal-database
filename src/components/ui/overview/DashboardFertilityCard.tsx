import { cx } from "@/lib/utils";


import { ProgressCircle } from "@/components/ProgressCircle_S";

export type KpiEntry = {
  title: string;
  percentage: number;
  current: number;
  allowed: number;
};

export type FertilityCardProps = {
  title: string;
  change: string;
  value: string;
  valueDescription: string;
  ctaDescription: string;
  ctaText: string;
  ctaLink: string;
  data: KpiEntry[];
};

export default function FertilityProgressCard({
  title,
  change,
  value,
  valueDescription,
  ctaDescription,
  ctaText,
  ctaLink,
  data,
}: FertilityCardProps) {
  // Check if there are zero fertility metrics
  const hasZeroFertilityMetrics = !data || data.length === 0 || data.every(item => item.current === 0);

  // If no data or zero fertility metrics, display a placeholder
  if (hasZeroFertilityMetrics) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
            {title}
          </h3>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl text-gray-900 dark:text-gray-50">
            0
          </span>
          <span className="text-sm text-gray-500">{valueDescription}</span>
        </div>
        <div className="flex h-40 items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No fertility information available</p>
            <p className="text-xs text-gray-400">Add pigs with fertility data to see metrics</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          {ctaDescription}{" "}
          <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400">
            {ctaText}
          </a>
        </p>
      </div>
    );
  }

  // Assign colors dynamically
  const colors = ["cyan", "blue", "indigo", "violet"];
  const bgColors = [
    "bg-cyan-500",  // Cyan
    "bg-blue-500",   // Blue
    "bg-indigo-500", // Indigo
    "bg-violet-500",  // Violet
  ];


  var count: number = 0;

  // Transform data to match Tremor DonutChart format
  const formattedData = data.map((item, idx) => ({
    name: item.title, // **Label**
    value: item.percentage, // **Percentage Value**
    color: colors[idx % colors.length], // Assign colors cyclically
  }));

  // Percentage Formatter for the Chart
  const percentageFormatter = (number: number) => `${number.toFixed(1)}%`;

  return (
    <div className="flex flex-col justify-between ">
      <div>
        <div className="flex items-center gap-2">
          <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
            {title}
          </dt>
        </div>

        <dd className="mt-2 flex items-baseline gap-2">
          <span className="text-xl text-gray-900 dark:text-gray-50">
            {value}
          </span>
          <span className="text-sm text-gray-500">{valueDescription}</span>
        </dd>



        <div className="flex justify-left items-center my-6 gap-2">
          <ProgressCircle value={data[0].percentage} radius={80} strokeWidth={7} variant="neutral">
            <ProgressCircle value={data[1].percentage} radius={70} strokeWidth={7}>
              <ProgressCircle
                value={data[2].percentage}
                radius={60}
                strokeWidth={7}
                variant="success"
              >
                <ProgressCircle
                  value={data[3].percentage}
                  radius={50}
                  strokeWidth={7}
                  variant="warning"
                >
                  <p>
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      {data[3].current + data[2].current + data[1].current + data[0].current}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      /{data[3].allowed}
                    </span>
                  </p>
                </ProgressCircle>
              </ProgressCircle>
            </ProgressCircle>
          </ProgressCircle>



          {/* Vertical Divider - NOW VISIBLE */}


          {/* <li key={item.title} className="flex items-center gap-2 text-xs">
                        <span
                          className={cx(item.color, "size-2.5 rounded-sm")}
                          aria-hidden="true"
                        />
                        <span className="text-gray-900 dark:text-gray-50">
                          {item.title}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          ({item.value} / {item.percentage}%)
                        </span>
                      </li> */}
          <div className="mt-2 flex items-center gap-0.5">
            {data.map((item, idx) => (
              <div
                key={item.title}
                className={cx(bgColors[idx % colors.length], `h-1.5 rounded-full`)}
                style={{ width: `${item.percentage}%` }}
              />
            ))}
          </div>

          {/* List of Pig Fertility Stats */}
          <ul role="list" className="mt-4 space-y-5">
            {data.map((item, idx) => (
              <li key={item.title} className="flex items-center gap-2 text-xs">
                <span
                  className={cx(bgColors[idx % colors.length], "size-2.5 rounded-sm")}
                  aria-hidden="true"
                />
                <span className="text-gray-900 dark:text-gray-50">
                  {item.title}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ({item.current} / {item.allowed})
                </span>
              </li>
            ))}
          </ul>

        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500">
            {ctaDescription}{" "}
            <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400">
              {ctaText}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
