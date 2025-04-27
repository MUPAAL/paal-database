import { Button } from "@/components/Button_S";
import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
  icon
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="bg-gray-100 p-3 rounded-full dark:bg-gray-800">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="whitespace-nowrap">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
