import { Button } from "@/components/Button_S";
import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

interface AdminStateWrapperProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
  loadingMessage?: string;
}

export function AdminStateWrapper({
  isLoading,
  error,
  onRetry,
  children,
  loadingMessage = "Loading..."
}: AdminStateWrapperProps) {
  if (isLoading) {
    return (
      <section aria-labelledby="loading-state">
        <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
              {loadingMessage}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please wait while we load the data...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-labelledby="error-message">
        <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center justify-center py-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-50">Something went wrong</h2>
            <p className="text-red-500 mb-6">{error}</p>
            <Button onClick={onRetry}>Retry</Button>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
