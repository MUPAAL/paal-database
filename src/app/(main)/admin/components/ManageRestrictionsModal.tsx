import { ExtendedUser } from "./UserTable";
import { FarmRestrictionManager } from "./FarmRestrictionManager";

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

type ManageRestrictionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: ExtendedUser | null;
  farms: Farm[];
  stalls: Stall[];
  onSave: (userId: string, restrictedFarms: string[], restrictedStalls: string[]) => void;
};

export function ManageRestrictionsModal({
  isOpen,
  onClose,
  user,
  farms,
  stalls,
  onSave,
}: ManageRestrictionsModalProps) {
  if (!isOpen || !user) return null;

  const handleSaveRestrictions = (restrictedFarms: string[], restrictedStalls: string[]) => {
    onSave(user._id, restrictedFarms, restrictedStalls);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl">
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            Manage Access Restrictions: {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-gray-500">
            Role: {user.role} | Email: {user.email}
          </p>
        </div>

        <FarmRestrictionManager
          farms={farms}
          stalls={stalls}
          initialRestrictedFarms={user.restrictedFarms || []}
          initialRestrictedStalls={user.restrictedStalls || []}
          onSave={handleSaveRestrictions}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
