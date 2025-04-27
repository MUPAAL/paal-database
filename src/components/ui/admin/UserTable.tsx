import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button_S";
import { Input } from "@/components/Input";
import { Permission } from "@/types/permissions";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Lock,
  MoreHorizontal,
  Search,
  Settings,
  Shield,
  Trash,
  UserCheck,
  UserMinus,
  Users,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  onCreateUser?: () => void; // Optional callback for creating a new user
};

export function UserTable({
  users,
  onAssignFarm,
  onToggleActive,
  onDelete,
  onManagePermissions,
  onManageRestrictions,
  currentUserId,
  onCreateUser,
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof ExtendedUser>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>(users);
  const [activeFilters, setActiveFilters] = useState<{
    role: string[];
    status: string[];
  }>({
    role: [],
    status: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const target = event.target as HTMLElement;
        // Only close if clicking outside both the dropdown menu and the trigger button
        if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-trigger')) {
          setOpenDropdown(null);
        }
      }
    };

    // Use capture phase to ensure our handler runs before other click handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [openDropdown]);

  // Update filtered users when users, search term, or filters change
  useEffect(() => {
    let result = [...users];

    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.firstName.toLowerCase().includes(lowerSearchTerm) ||
          user.lastName.toLowerCase().includes(lowerSearchTerm) ||
          user.email.toLowerCase().includes(lowerSearchTerm) ||
          user.role.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply role filters
    if (activeFilters.role.length > 0) {
      result = result.filter((user) =>
        activeFilters.role.includes(user.role.toLowerCase())
      );
    }

    // Apply status filters
    if (activeFilters.status.length > 0) {
      result = result.filter((user) =>
        activeFilters.status.includes(user.isActive ? "active" : "inactive")
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle nested properties or special cases
      if (sortField === "assignedFarm") {
        aValue = a.assignedFarm?.name || "";
        bValue = b.assignedFarm?.name || "";
      }

      // Convert to lowercase if string
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, sortField, sortDirection, activeFilters]);

  // Function to handle sort
  const handleSort = (field: keyof ExtendedUser) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Function to toggle filter
  const toggleFilter = (type: "role" | "status", value: string) => {
    setActiveFilters((prev) => {
      const current = [...prev[type]];
      const index = current.indexOf(value);

      if (index === -1) {
        current.push(value);
      } else {
        current.splice(index, 1);
      }

      return { ...prev, [type]: current };
    });
  };

  // Function to clear all filters
  const clearFilters = () => {
    setActiveFilters({ role: [], status: [] });
    setSearchTerm("");
  };

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

  // Function to toggle expanded user
  const toggleExpandUser = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Get unique roles for filters
  const uniqueRoles = Array.from(new Set(users.map(user => user.role.toLowerCase())));

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Create User Button */}
          {onCreateUser && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onCreateUser}
              className="flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              Create User
            </Button>
          )}

          {/* Filter Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(activeFilters.role.length > 0 || activeFilters.status.length > 0) && (
              <Badge color="blue" className="ml-1">
                {activeFilters.role.length + activeFilters.status.length}
              </Badge>
            )}
          </Button>

          {/* Clear Filters Button */}
          {(activeFilters.role.length > 0 || activeFilters.status.length > 0) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Role</h4>
              <div className="space-y-1">
                {uniqueRoles.map((role) => (
                  <div key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-${role}`}
                      checked={activeFilters.role.includes(role)}
                      onChange={() => toggleFilter("role", role)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`role-${role}`}
                      className="ml-2 block text-sm text-gray-900 dark:text-gray-100 capitalize"
                    >
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status-active"
                    checked={activeFilters.status.includes("active")}
                    onChange={() => toggleFilter("status", "active")}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="status-active"
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                  >
                    Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status-inactive"
                    checked={activeFilters.status.includes("inactive")}
                    onChange={() => toggleFilter("status", "inactive")}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="status-inactive"
                    className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                  >
                    Inactive
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(activeFilters.role.length > 0 || activeFilters.status.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.role.map((role) => (
            <Badge key={`filter-${role}`} color="blue" className="flex items-center gap-1">
              Role: <span className="capitalize">{role}</span>
              <button
                onClick={() => toggleFilter("role", role)}
                className="ml-1 hover:text-gray-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {activeFilters.status.map((status) => (
            <Badge key={`filter-${status}`} color="blue" className="flex items-center gap-1">
              Status: <span className="capitalize">{status}</span>
              <button
                onClick={() => toggleFilter("status", status)}
                className="ml-1 hover:text-gray-100"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-500 mb-2">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* User Table */}
      <div className="relative overflow-visible">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y border-gray-200 dark:border-gray-800 text-left">
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => handleSort("firstName")}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Name
                  {sortField === "firstName" && (
                    sortDirection === "asc" ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => handleSort("email")}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Email
                  {sortField === "email" && (
                    sortDirection === "asc" ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => handleSort("role")}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Role
                  {sortField === "role" && (
                    sortDirection === "asc" ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                Access
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => handleSort("isActive")}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Status
                  {sortField === "isActive" && (
                    sortDirection === "asc" ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No users found matching your criteria
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="contents">
                  <tr
                    className={`group select-none hover:bg-gray-50 hover:dark:bg-gray-900 ${expandedUser === user._id ? "bg-gray-50 dark:bg-gray-900" : ""
                      }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleExpandUser(user._id)}
                        className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {expandedUser === user._id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 md:hidden">
                            {user.email}
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-indigo-500" />
                          <span className="text-xs">
                            {user.permissions?.length || 0} permissions
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lock className="h-3 w-3 text-amber-500" />
                          <span className="text-xs">
                            {(user.restrictedFarms?.length || 0) + (user.restrictedStalls?.length || 0)} restrictions
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={user.isActive ? "green" : "red"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="relative">
                          <Button
                            ref={(el) => buttonRefs.current[user._id] = el}
                            variant="secondary"
                            size="sm"
                            className="flex items-center dropdown-trigger"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openDropdown === user._id) {
                                setOpenDropdown(null);
                              } else {
                                const button = buttonRefs.current[user._id];
                                if (button) {
                                  const rect = button.getBoundingClientRect();
                                  // Calculate position to center the dropdown under the button
                                  const dropdownWidth = 192; // w-48 = 12rem = 192px
                                  setDropdownPosition({
                                    top: rect.bottom + window.scrollY + 5, // Add a small offset
                                    left: rect.left + window.scrollX - (dropdownWidth - rect.width) / 2 // Center dropdown
                                  });
                                  setOpenDropdown(user._id);
                                }
                              }
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>

                          {openDropdown === user._id && (
                            <div
                              className="fixed w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 dropdown-menu"
                              style={{
                                zIndex: 9999,
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`
                              }}>
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    onManagePermissions(user);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Shield className="h-4 w-4" />
                                  Manage Permissions
                                </button>
                                <button
                                  onClick={() => {
                                    onManageRestrictions(user);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Lock className="h-4 w-4" />
                                  Manage Restrictions
                                </button>
                                <button
                                  onClick={() => {
                                    onAssignFarm(user);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Settings className="h-4 w-4" />
                                  Assign Farm
                                </button>
                                <button
                                  onClick={() => {
                                    onToggleActive(user);
                                    setOpenDropdown(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  {user.isActive ? (
                                    <>
                                      <UserMinus className="h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </button>
                                {user._id !== currentUserId && (
                                  <button
                                    onClick={() => {
                                      onDelete(user);
                                      setOpenDropdown(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <Trash className="h-4 w-4" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedUser === user._id && (
                    <tr className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">User Details</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Created:</span>
                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated:</span>
                                <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">ID:</span>
                                <span className="text-xs">{user._id}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Farm Assignment</h4>
                            {user.assignedFarm ? (
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Farm:</span>
                                  <span>{user.assignedFarm.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Location:</span>
                                  <span>{user.assignedFarm.location}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">No farm assigned</div>
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onManagePermissions(user)}
                                className="flex items-center gap-1"
                              >
                                <Shield className="h-3 w-3" />
                                Permissions
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onManageRestrictions(user)}
                                className="flex items-center gap-1"
                              >
                                <Lock className="h-3 w-3" />
                                Restrictions
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onToggleActive(user)}
                                className="flex items-center gap-1"
                              >
                                {user.isActive ? (
                                  <>
                                    <UserMinus className="h-3 w-3" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-3 w-3" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (simplified for this example) */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}
