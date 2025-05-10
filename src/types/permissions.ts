// Define all possible permissions in the system
export const PERMISSIONS = {
  // Farm permissions
  CREATE_FARM: 'create_farm',
  EDIT_FARM: 'edit_farm',
  DELETE_FARM: 'delete_farm',
  VIEW_ALL_FARMS: 'view_all_farms',
  
  // Stall permissions
  CREATE_STALL: 'create_stall',
  EDIT_STALL: 'edit_stall',
  DELETE_STALL: 'delete_stall',
  
  // Pig permissions
  CREATE_PIG: 'create_pig',
  EDIT_PIG: 'edit_pig',
  DELETE_PIG: 'delete_pig',
  VIEW_PIG_HEALTH: 'view_pig_health',
  
  // Health record permissions
  CREATE_HEALTH_RECORD: 'create_health_record',
  EDIT_HEALTH_RECORD: 'edit_health_record',
  DELETE_HEALTH_RECORD: 'delete_health_record',
  
  // Report permissions
  GENERATE_REPORTS: 'generate_reports',
  EXPORT_DATA: 'export_data',
  
  // User management permissions
  MANAGE_USERS: 'manage_users',
  
  // System permissions
  VIEW_SYSTEM_METRICS: 'view_system_metrics',
  CONFIGURE_SYSTEM: 'configure_system',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Define role templates with default permissions
export const ROLE_TEMPLATES = {
  ADMIN: {
    name: 'Administrator',
    description: 'Full access to all system features',
    permissions: Object.values(PERMISSIONS),
  },
  FARM_MANAGER: {
    name: 'Farm Manager',
    description: 'Can manage assigned farms and all related data',
    permissions: [
      PERMISSIONS.VIEW_ALL_FARMS,
      PERMISSIONS.EDIT_FARM,
      PERMISSIONS.CREATE_STALL,
      PERMISSIONS.EDIT_STALL,
      PERMISSIONS.DELETE_STALL,
      PERMISSIONS.CREATE_PIG,
      PERMISSIONS.EDIT_PIG,
      PERMISSIONS.DELETE_PIG,
      PERMISSIONS.VIEW_PIG_HEALTH,
      PERMISSIONS.CREATE_HEALTH_RECORD,
      PERMISSIONS.EDIT_HEALTH_RECORD,
      PERMISSIONS.DELETE_HEALTH_RECORD,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.EXPORT_DATA,
    ],
  },
  VETERINARIAN: {
    name: 'Veterinarian',
    description: 'Can view and manage health records',
    permissions: [
      PERMISSIONS.VIEW_ALL_FARMS,
      PERMISSIONS.VIEW_PIG_HEALTH,
      PERMISSIONS.CREATE_HEALTH_RECORD,
      PERMISSIONS.EDIT_HEALTH_RECORD,
      PERMISSIONS.GENERATE_REPORTS,
    ],
  },
  DATA_ENTRY: {
    name: 'Data Entry',
    description: 'Can add and edit basic information',
    permissions: [
      PERMISSIONS.CREATE_PIG,
      PERMISSIONS.EDIT_PIG,
      PERMISSIONS.CREATE_HEALTH_RECORD,
    ],
  },
  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access to assigned farms',
    permissions: [
      PERMISSIONS.VIEW_PIG_HEALTH,
    ],
  },
} as const;

export type RoleTemplate = keyof typeof ROLE_TEMPLATES;

// Extended user type with permissions
export interface UserPermissions {
  role: string;
  permissions: Permission[];
  restrictedFarms?: string[]; // IDs of farms the user is restricted to
  restrictedStalls?: string[]; // IDs of stalls the user is restricted to
}
