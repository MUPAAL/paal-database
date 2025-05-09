import { Card } from "@/components/Card";
import { SimpleButton } from "@/components/SimpleButton";
import { Building2 } from "lucide-react";

interface FarmType {
  _id: string;
  name: string;
  location: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminFarmCardProps {
  farm: FarmType;
  onView: (farm: FarmType) => void;
  onEdit: (farm: FarmType) => void;
}

export function AdminFarmCard({ farm, onView, onEdit }: AdminFarmCardProps) {
  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 flex">
        <div className="bg-green-100 p-3 rounded-full dark:bg-green-900 mr-4 h-fit">
          <Building2 className="h-5 w-5 text-green-600 dark:text-green-300" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-50">{farm.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {farm.location}
          </p>
          {farm.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {farm.description}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Created: {new Date(farm.createdAt).toLocaleDateString()}
          </p>
          <div className="flex mt-3 space-x-2">
            <SimpleButton
              variant="secondary"
              className="text-sm py-1 px-2"
              onClick={(e) => {
                e.preventDefault();
                onView(farm);
              }}
            >
              View
            </SimpleButton>
            <SimpleButton
              variant="secondary"
              className="text-sm py-1 px-2"
              onClick={(e) => {
                e.preventDefault();
                onEdit(farm);
              }}
            >
              Edit
            </SimpleButton>
          </div>
        </div>
      </div>
    </div>
  );
}
