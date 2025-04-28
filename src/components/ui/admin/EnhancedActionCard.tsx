import { ReactNode } from "react";

export type EnhancedActionCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "yellow" | "indigo";
  onClick?: () => void;
  href?: string;
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
  return `p-3 rounded-xl shadow-md mb-4 ${classes[color] || classes.blue}`;
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

export function EnhancedActionCard({
  title,
  description,
  icon,
  color = "blue",
  onClick,
  href
}: EnhancedActionCardProps) {
  const CardComponent = href ? 'a' : 'div';
  const cardProps = href ? { href } : {};

  return (
    <div
      className="flex flex-col p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm cursor-pointer"
      onClick={onClick}
    >
      <div className={getIconContainerClass(color)}>
        <div className={getIconClass(color)}>
          {icon}
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-lg">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <div className="mt-auto pt-4">
        <div className={`text-sm font-medium ${color ? `text-${color}-600 dark:text-${color}-400` : 'text-indigo-600 dark:text-indigo-400'} flex items-center`}>
          <span className="truncate">Learn more</span>
          <span className="ml-1">→</span>
        </div>
      </div>
    </div>
  );
}
