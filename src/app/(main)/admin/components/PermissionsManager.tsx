import { Button } from "@/components/Button_S";
import { Label } from "@/components/Label";
import { PERMISSIONS, ROLE_TEMPLATES, Permission } from "@/types/permissions";
import { useState } from "react";

type PermissionsManagerProps = {
  initialPermissions: Permission[];
  onSave: (permissions: Permission[]) => void;
  onCancel: () => void;
};

export function PermissionsManager({
  initialPermissions,
  onSave,
  onCancel,
}: PermissionsManagerProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    initialPermissions || []
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Group permissions by category for better organization
  const permissionCategories = {
    Farm: [
      PERMISSIONS.CREATE_FARM,
      PERMISSIONS.EDIT_FARM,
      PERMISSIONS.DELETE_FARM,
      PERMISSIONS.VIEW_ALL_FARMS,
    ],
    Stall: [
      PERMISSIONS.CREATE_STALL,
      PERMISSIONS.EDIT_STALL,
      PERMISSIONS.DELETE_STALL,
    ],
    Pig: [
      PERMISSIONS.CREATE_PIG,
      PERMISSIONS.EDIT_PIG,
      PERMISSIONS.DELETE_PIG,
      PERMISSIONS.VIEW_PIG_HEALTH,
    ],
    "Health Records": [
      PERMISSIONS.CREATE_HEALTH_RECORD,
      PERMISSIONS.EDIT_HEALTH_RECORD,
      PERMISSIONS.DELETE_HEALTH_RECORD,
    ],
    Reports: [PERMISSIONS.GENERATE_REPORTS, PERMISSIONS.EXPORT_DATA],
    Administration: [
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.VIEW_SYSTEM_METRICS,
      PERMISSIONS.CONFIGURE_SYSTEM,
    ],
  };

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSelectAll = (category: Permission[]) => {
    setSelectedPermissions((prev) => {
      const newPermissions = [...prev];
      category.forEach((permission) => {
        if (!newPermissions.includes(permission)) {
          newPermissions.push(permission);
        }
      });
      return newPermissions;
    });
  };

  const handleDeselectAll = (category: Permission[]) => {
    setSelectedPermissions((prev) => {
      return prev.filter((p) => !category.includes(p));
    });
  };

  const handleApplyTemplate = (templateKey: string) => {
    const template = ROLE_TEMPLATES[templateKey as keyof typeof ROLE_TEMPLATES];
    if (template) {
      setSelectedPermissions(template.permissions);
    }
    setSelectedTemplate("");
  };

  const formatPermissionName = (permission: string) => {
    return permission
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Manage Permissions</h2>

      <div className="mb-6">
        <Label htmlFor="template">Apply Role Template</Label>
        <div className="flex gap-2 mt-2">
          <select
            id="template"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select a template...</option>
            {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
              <option key={key} value={key}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => handleApplyTemplate(selectedTemplate)}
            disabled={!selectedTemplate}
          >
            Apply
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(permissionCategories).map(([category, permissions]) => (
          <div key={category} className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">{category} Permissions</h3>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSelectAll(permissions)}
                >
                  Select All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeselectAll(permissions)}
                >
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {permissions.map((permission) => (
                <div key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={permission}
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                  >
                    {formatPermissionName(permission)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(selectedPermissions)}>Save Permissions</Button>
      </div>
    </div>
  );
}
