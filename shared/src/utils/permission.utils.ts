import { UserRole } from "../types/auth.types";
import { ROLE_PERMISSIONS, PERMISSIONS } from "../constants/auth.constants";

/**
 * Check if a user role has a specific permission
 */
export const hasPermission = (
  userRole: UserRole,
  permission: string
): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission as any);
};

/**
 * Check if a user role has any of the specified permissions
 */
export const hasAnyPermission = (
  userRole: UserRole,
  permissions: string[]
): boolean => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

/**
 * Check if a user role has all of the specified permissions
 */
export const hasAllPermissions = (
  userRole: UserRole,
  permissions: string[]
): boolean => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};

/**
 * Get all permissions for a user role
 */
export const getRolePermissions = (userRole: UserRole): readonly string[] => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Check if a user can manage employees (create, update, delete)
 */
export const canManageEmployees = (userRole: UserRole): boolean => {
  return hasAnyPermission(userRole, [
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.EMPLOYEE_DELETE,
  ]);
};

/**
 * Check if a user can view all employees or only their own team
 */
export const canViewAllEmployees = (userRole: UserRole): boolean => {
  return hasPermission(userRole, PERMISSIONS.EMPLOYEE_READ_ALL);
};

/**
 * Check if a user can approve leave requests
 */
export const canApproveLeaves = (userRole: UserRole): boolean => {
  return hasPermission(userRole, PERMISSIONS.LEAVE_APPROVE);
};

/**
 * Check if a user can manage payroll
 */
export const canManagePayroll = (userRole: UserRole): boolean => {
  return hasAnyPermission(userRole, [
    PERMISSIONS.PAYROLL_CREATE,
    PERMISSIONS.PAYROLL_UPDATE,
    PERMISSIONS.PAYROLL_PROCESS,
  ]);
};

/**
 * Check if a user can manage recruitment
 */
export const canManageRecruitment = (userRole: UserRole): boolean => {
  return hasAnyPermission(userRole, [
    PERMISSIONS.RECRUITMENT_CREATE,
    PERMISSIONS.RECRUITMENT_UPDATE,
    PERMISSIONS.RECRUITMENT_DELETE,
  ]);
};

/**
 * Check if a user can access system administration features
 */
export const isSystemAdmin = (userRole: UserRole): boolean => {
  return hasPermission(userRole, PERMISSIONS.SYSTEM_ADMIN);
};

/**
 * Check if a user can access reports
 */
export const canAccessReports = (userRole: UserRole): boolean => {
  return hasAnyPermission(userRole, [
    PERMISSIONS.REPORTS_EMPLOYEE,
    PERMISSIONS.REPORTS_LEAVE,
    PERMISSIONS.REPORTS_PAYROLL,
    PERMISSIONS.REPORTS_RECRUITMENT,
  ]);
};

/**
 * Get permissions by module
 */
export const getPermissionsByModule = (
  userRole: UserRole,
  module: string
): string[] => {
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions.filter((permission) =>
    permission.startsWith(`${module}:`)
  );
};

/**
 * Check if a user is HR personnel (HR Admin or HR Manager)
 */
export const isHRPersonnel = (userRole: UserRole): boolean => {
  return userRole === "HR_ADMIN" || userRole === "HR_MANAGER";
};

/**
 * Check if a user is a manager (any type of manager)
 */
export const isManager = (userRole: UserRole): boolean => {
  return (
    userRole === "MANAGER" ||
    userRole === "HR_MANAGER" ||
    userRole === "HR_ADMIN" ||
    userRole === "SUPER_ADMIN"
  );
};

/**
 * Get the hierarchy level of a role (higher number = more permissions)
 */
export const getRoleHierarchy = (userRole: UserRole): number => {
  const hierarchy = {
    READONLY: 1,
    EMPLOYEE: 2,
    MANAGER: 3,
    HR_MANAGER: 4,
    HR_ADMIN: 5,
    SUPER_ADMIN: 6,
  };

  return hierarchy[userRole] || 0;
};

/**
 * Check if one role has higher privileges than another
 */
export const hasHigherPrivileges = (
  role1: UserRole,
  role2: UserRole
): boolean => {
  return getRoleHierarchy(role1) > getRoleHierarchy(role2);
};

/**
 * Check if a user can manage another user based on role hierarchy
 */
export const canManageUser = (
  managerRole: UserRole,
  targetRole: UserRole
): boolean => {
  return hasHigherPrivileges(managerRole, targetRole);
};

/**
 * Filter menu items based on user permissions
 */
export const filterMenuByPermissions = <
  T extends { requiredPermissions?: string[] }
>(
  menuItems: T[],
  userRole: UserRole
): T[] => {
  return menuItems.filter((item) => {
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true;
    }
    return hasAnyPermission(userRole, item.requiredPermissions);
  });
};
