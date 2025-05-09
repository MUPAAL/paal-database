import { Button } from "@/components/Button_S";
import { Label } from "@/components/Label";
import { useState, useEffect } from "react";

type Farm = {
  _id: string;
  name: string;
  location: string;
};

type Stall = {
  _id: string;
  name: string;
  farmId: string;
};

type FarmRestrictionManagerProps = {
  farms: Farm[];
  stalls: Stall[];
  initialRestrictedFarms: string[];
  initialRestrictedStalls: string[];
  onSave: (restrictedFarms: string[], restrictedStalls: string[]) => void;
  onCancel: () => void;
};

export function FarmRestrictionManager({
  farms,
  stalls,
  initialRestrictedFarms,
  initialRestrictedStalls,
  onSave,
  onCancel,
}: FarmRestrictionManagerProps) {
  const [restrictedFarms, setRestrictedFarms] = useState<string[]>(
    initialRestrictedFarms || []
  );
  const [restrictedStalls, setRestrictedStalls] = useState<string[]>(
    initialRestrictedStalls || []
  );
  const [restrictionMode, setRestrictionMode] = useState<"allow" | "restrict">("allow");
  const [selectedFarm, setSelectedFarm] = useState<string>("");

  // Filter stalls based on selected farm
  const farmStalls = stalls.filter((stall) => stall.farmId === selectedFarm);

  // Handle farm selection
  const handleFarmToggle = (farmId: string) => {
    setRestrictedFarms((prev) => {
      if (prev.includes(farmId)) {
        // Remove farm and its stalls from restrictions
        const farmStallIds = stalls
          .filter((stall) => stall.farmId === farmId)
          .map((stall) => stall._id);
        
        setRestrictedStalls((prevStalls) => 
          prevStalls.filter((stallId) => !farmStallIds.includes(stallId))
        );
        
        return prev.filter((id) => id !== farmId);
      } else {
        return [...prev, farmId];
      }
    });
  };

  // Handle stall selection
  const handleStallToggle = (stallId: string) => {
    setRestrictedStalls((prev) => {
      if (prev.includes(stallId)) {
        return prev.filter((id) => id !== stallId);
      } else {
        return [...prev, stallId];
      }
    });
  };

  // Toggle all stalls for a farm
  const handleToggleAllStalls = (farmId: string, select: boolean) => {
    const farmStallIds = stalls
      .filter((stall) => stall.farmId === farmId)
      .map((stall) => stall._id);
    
    if (select) {
      // Add all stalls
      setRestrictedStalls((prev) => {
        const newStalls = [...prev];
        farmStallIds.forEach((stallId) => {
          if (!newStalls.includes(stallId)) {
            newStalls.push(stallId);
          }
        });
        return newStalls;
      });
    } else {
      // Remove all stalls
      setRestrictedStalls((prev) => 
        prev.filter((stallId) => !farmStallIds.includes(stallId))
      );
    }
  };

  // Toggle restriction mode
  const handleModeChange = (mode: "allow" | "restrict") => {
    setRestrictionMode(mode);
    // Clear selections when changing modes
    setRestrictedFarms([]);
    setRestrictedStalls([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Manage Access Restrictions</h2>

      <div className="mb-6">
        <Label>Restriction Mode</Label>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="allow-mode"
              name="restriction-mode"
              checked={restrictionMode === "allow"}
              onChange={() => handleModeChange("allow")}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="allow-mode" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Allow only selected farms/stalls
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="restrict-mode"
              name="restriction-mode"
              checked={restrictionMode === "restrict"}
              onChange={() => handleModeChange("restrict")}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="restrict-mode" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Restrict access to selected farms/stalls
            </label>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {restrictionMode === "allow" 
            ? "User will ONLY have access to the selected farms and stalls." 
            : "User will have access to all farms EXCEPT the selected ones."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Farm selection */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3">Farms</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {farms.map((farm) => (
              <div key={farm._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`farm-${farm._id}`}
                  checked={restrictedFarms.includes(farm._id)}
                  onChange={() => handleFarmToggle(farm._id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`farm-${farm._id}`}
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                  onClick={() => setSelectedFarm(farm._id)}
                >
                  {farm.name} ({farm.location})
                </label>
              </div>
            ))}
            {farms.length === 0 && (
              <p className="text-sm text-gray-500">No farms available</p>
            )}
          </div>
        </div>

        {/* Stall selection */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Stalls</h3>
            {selectedFarm && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleAllStalls(selectedFarm, true)}
                >
                  Select All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleAllStalls(selectedFarm, false)}
                >
                  Deselect All
                </Button>
              </div>
            )}
          </div>
          
          {selectedFarm ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {farmStalls.map((stall) => (
                <div key={stall._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`stall-${stall._id}`}
                    checked={restrictedStalls.includes(stall._id)}
                    onChange={() => handleStallToggle(stall._id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`stall-${stall._id}`}
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                  >
                    {stall.name}
                  </label>
                </div>
              ))}
              {farmStalls.length === 0 && (
                <p className="text-sm text-gray-500">No stalls available for this farm</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a farm to view its stalls</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(restrictedFarms, restrictedStalls)}>
          Save Restrictions
        </Button>
      </div>
    </div>
  );
}
