import { cx } from "@/lib/utils";

export type AdminActionProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export function AdminActionCard({
  title,
  description,
  icon,
  onClick,
}: AdminActionProps) {
  return (
    <div
      onClick={onClick}
      className={cx(
        "flex flex-col p-4 border border-gray-200 dark:border-gray-800 rounded-lg",
        "bg-white dark:bg-gray-950",
        "cursor-pointer"
      )}
    >
      <div className="mb-3">
        {icon}
      </div>
      <h3 className="font-medium text-gray-900 dark:text-gray-50">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
