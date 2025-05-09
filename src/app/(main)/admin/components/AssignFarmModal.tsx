import { Button } from "@/components/Button_S";
import { Label } from "@/components/Label";
import { useState } from "react";

type Farm = {
  _id: string;
  name: string;
  location: string;
};

type AssignFarmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (farmId: string) => void;
  farms: Farm[];
  currentFarmId: string;
  userName: string;
};

export function AssignFarmModal({
  isOpen,
  onClose,
  onSubmit,
  farms,
  currentFarmId,
  userName,
}: AssignFarmModalProps) {
  const [selectedFarmId, setSelectedFarmId] = useState(currentFarmId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedFarmId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Assign Farm to {userName}</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="farmId">Select Farm</Label>
              <select
                id="farmId"
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">-- No Farm Assigned --</option>
                {farms.map((farm) => (
                  <option key={farm._id} value={farm._id}>
                    {farm.name} {farm.location ? `(${farm.location})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit">Assign Farm</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
