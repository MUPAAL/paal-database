import { Badge } from "@/components/Badge";

export type AdminActivityCardProps = {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
};

export function AdminActivityCard({
  title,
  children,
  icon,
}: AdminActivityCardProps) {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900 sm:text-lg dark:text-gray-50">
            {title}
          </h2>
        </div>
        {icon && (
          <div className="bg-gray-100 p-2 rounded-full dark:bg-gray-800">
            {icon}
          </div>
        )}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
