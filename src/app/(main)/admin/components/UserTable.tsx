import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button_S";

type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "farmer";
  assignedFarm: {
    _id: string;
    name: string;
    location: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type UserTableProps = {
  users: User[];
  onAssignFarm: (user: User) => void;
  onToggleActive: (user: User) => void;
  onDelete: (user: User) => void;
  currentUserId: string;
};

export function UserTable({
  users,
  onAssignFarm,
  onToggleActive,
  onDelete,
  currentUserId,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Farm</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              <td className="px-4 py-2">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">
                <Badge
                  color={user.role === "admin" ? "blue" : "green"}
                >
                  {user.role}
                </Badge>
              </td>
              <td className="px-4 py-2">
                {user.assignedFarm ? (
                  <span>{user.assignedFarm.name}</span>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </td>
              <td className="px-4 py-2">
                <Badge
                  color={user.isActive ? "green" : "red"}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-2">
                  {user.role === "farmer" && (
                    <Button
                      variant="secondary"
                      onClick={() => onAssignFarm(user)}
                    >
                      Assign Farm
                    </Button>
                  )}
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
