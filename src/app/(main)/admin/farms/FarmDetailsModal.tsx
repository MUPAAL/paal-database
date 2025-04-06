"use client";

import { SimpleButton } from "@/components/SimpleButton";
import { useEffect, useState } from "react";

type FarmType = {
  _id: string;
  name: string;
  location: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

type FarmDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmType | null;
  mode: "view" | "edit";
};

export default function FarmDetailsModal({
  isOpen,
  onClose,
  farm,
  mode
}: FarmDetailsModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    isActive: true
  });

  useEffect(() => {
    console.log('FarmDetailsModal - farm prop changed:', farm);
    console.log('FarmDetailsModal - isOpen:', isOpen, 'mode:', mode);

    if (farm) {
      const newFormData = {
        name: farm.name,
        location: farm.location,
        description: farm.description || "",
        isActive: farm.isActive !== false
      };

      console.log('FarmDetailsModal - setting formData:', newFormData);
      setFormData(newFormData);
    } else {
      console.log('FarmDetailsModal - farm is null, using default formData');
    }
  }, [farm, isOpen, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would save the changes
    alert(`Farm ${mode === "edit" ? "updated" : "viewed"}: ${formData.name}`);
    onClose();
  };

  if (!isOpen) {
    console.log('FarmDetailsModal - not open, returning null');
    return null;
  }

  // If the modal is open but farm is null, show a message
  if (!farm && mode !== 'create') {
    console.log('FarmDetailsModal - farm is null, showing error message');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Error</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <p className="mb-4">No farm data available. Please try again.</p>
          <div className="flex justify-end">
            <SimpleButton
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Close
            </SimpleButton>
          </div>
        </div>
      </div>
    );
  }

  console.log('FarmDetailsModal - rendering modal, isOpen:', isOpen);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === "view" ? "Farm Details" : "Edit Farm"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Farm Name
              </label>
              {mode === "view" ? (
                <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700">
                  {formData.name}
                </div>
              ) : (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Location
              </label>
              {mode === "view" ? (
                <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700">
                  {formData.location}
                </div>
              ) : (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              {mode === "view" ? (
                <div className="p-2 border rounded bg-gray-50 dark:bg-gray-700 min-h-[60px]">
                  {formData.description || "N/A"}
                </div>
              ) : (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              )}
            </div>

            <div className="flex items-center">
              {mode === "view" ? (
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${formData.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="text-sm">
                    Active
                  </label>
                </div>
              )}
            </div>

            {farm ? (
              <div className="text-xs text-gray-500 mt-4">
                <div>Created: {new Date(farm.createdAt).toLocaleString()}</div>
                <div>Last Updated: {new Date(farm.updatedAt).toLocaleString()}</div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-4">
                <div>No farm data available</div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <SimpleButton
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </SimpleButton>
            {mode === "edit" && (
              <SimpleButton type="submit">
                Save Changes
              </SimpleButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
