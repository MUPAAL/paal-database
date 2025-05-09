import { SimpleButton } from "@/components/SimpleButton";
import { ReactNode } from "react";

interface AdminEmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon: ReactNode;
}

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon
}: AdminEmptyStateProps) {
  return (
    <div className="col-span-full text-center p-8 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-50">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        {description}
      </p>
      <SimpleButton onClick={onAction}>{actionLabel}</SimpleButton>
    </div>
  );
}
