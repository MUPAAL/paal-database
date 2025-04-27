import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button_S";
import { Permission } from "@/types/permissions";
import { Lock, Settings, Shield } from "lucide-react";

export type ExtendedUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  assignedFarm: {
    _id: string;
    name: string;
    location: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
  restrictedFarms?: string[];
  restrictedStalls?: string[];
};

type UserTableProps = {
  users: ExtendedUser[];
  onAssignFarm: (user: ExtendedUser) => void;
  onToggleActive: (user: ExtendedUser) => void;
  onDelete: (user: ExtendedUser) => void;
  onManagePermissions: (user: ExtendedUser) => void;
  onManageRestrictions: (user: ExtendedUser) => void;
  currentUserId: string;
};

export function UserTable({
  users,
  onAssignFarm,
  onToggleActive,
  onDelete,
  onManagePermissions,
  onManageRestrictions,
  currentUserId,
}: UserTableProps) {
  // Function to get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'blue';
      case 'farm manager':
        return 'green';
      case 'veterinarian':
        return 'purple';
      case 'data entry':
        return 'orange';
      case 'viewer':
        return 'gray';
      default:
        return 'indigo';
    }
  };

  // Function to get permission count badge
  const getPermissionBadge = (user: ExtendedUser) => {
    const count = user.permissions?.length || 0;
    return (
      <Badge color="indigo" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        {count}
      </Badge>
    );
  };

  // Function to get restriction badge
  const getRestrictionBadge = (user: ExtendedUser) => {
    const farmCount = user.restrictedFarms?.length || 0;
    const stallCount = user.restrictedStalls?.length || 0;

    if (farmCount === 0 && stallCount === 0) {
      return <span className="text-gray-400 text-xs">None</span>;
    }

    return (
      <Badge color="amber" className="flex items-center gap-1">
        <Lock className="h-3 w-3" />
        {farmCount > 0 ? `${farmCount} farms` : ''}
        {farmCount > 0 && stallCount > 0 ? ', ' : ''}
        {stallCount > 0 ? `${stallCount} stalls` : ''}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Permissions</th>
            <th className="px-4 py-2 text-left">Restrictions</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="px-4 py-2">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">
                <Badge color={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-4 py-2">
                {getPermissionBadge(user)}
              </td>
              <td className="px-4 py-2">
                {getRestrictionBadge(user)}
              </td>
              <td className="px-4 py-2">
                <Badge color={user.isActive ? "green" : "red"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onManagePermissions(user)}
                    title="Manage Permissions"
                  >
                    <Shield className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onManageRestrictions(user)}
                    title="Manage Access Restrictions"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onAssignFarm(user)}
                    title="Assign Farm"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => onToggleActive(user)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>

                  {user._id !== currentUserId && (
                    <Button
                      variant="secondary"
                      onClick={() => onDelete(user)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
