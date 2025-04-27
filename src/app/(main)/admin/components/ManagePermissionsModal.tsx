import { ExtendedUser } from "./UserTable";
import { PermissionsManager } from "./PermissionsManager";
import { Permission } from "@/types/permissions";

type ManagePermissionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: ExtendedUser | null;
  onSave: (userId: string, permissions: Permission[]) => void;
};

export function ManagePermissionsModal({
  isOpen,
  onClose,
  user,
  onSave,
}: ManagePermissionsModalProps) {
  if (!isOpen || !user) return null;

  const handleSavePermissions = (permissions: Permission[]) => {
    onSave(user._id, permissions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl">
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            Manage Permissions: {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-gray-500">
            Role: {user.role} | Email: {user.email}
          </p>
        </div>

        <PermissionsManager
          initialPermissions={user.permissions || []}
          onSave={handleSavePermissions}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
