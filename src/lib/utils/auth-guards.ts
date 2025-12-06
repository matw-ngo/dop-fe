import type { User } from "@/store/use-auth-store";

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, role: string): boolean {
  return user?.role === role;
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, "admin");
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(user: User | null): boolean {
  return user !== null;
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if a user has all of the specified roles
 */
export function hasAllRoles(user: User | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.every((role) => user.role === role);
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(user: User | null): string[] {
  if (!user) return [];

  const rolePermissions: Record<string, string[]> = {
    admin: [
      "read:all",
      "write:all",
      "delete:all",
      "manage:users",
      "manage:flows",
      "manage:leads",
      "view:analytics",
      "manage:settings",
    ],
    user: [
      "read:own",
      "write:own",
      "view:own-applications",
      "manage:own-profile",
    ],
  };

  return rolePermissions[user.role] || [];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  const permissions = getUserPermissions(user);

  // Check for exact permission match
  if (permissions.includes(permission)) {
    return true;
  }

  // Check for wildcard permissions
  const [action, resource] = permission.split(":");
  if (permissions.includes(`${action}:all`)) {
    return true;
  }

  return false;
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) return false;

  // Define route permissions
  const routePermissions = [
    { pattern: /^\/admin$/, permissions: ["read:all"] },
    { pattern: /^\/admin\/flows$/, permissions: ["manage:flows"] },
    { pattern: /^\/admin\/leads$/, permissions: ["manage:leads"] },
    { pattern: /^\/admin\/users$/, permissions: ["manage:users"] },
    { pattern: /^\/admin\/analytics$/, permissions: ["view:analytics"] },
    { pattern: /^\/admin\/settings$/, permissions: ["manage:settings"] },
    { pattern: /^\/admin\/.+$/, permissions: ["read:all"] },
  ];

  // Find matching route permissions
  const matchingRoute = routePermissions.find(({ pattern }) =>
    pattern.test(route),
  );

  if (!matchingRoute) {
    // If no specific permissions required, admin can access
    return user.role === "admin";
  }

  // Check if user has any of the required permissions
  return matchingRoute.permissions.some((permission) =>
    hasPermission(user, permission),
  );
}

/**
 * Get redirect path based on user role
 */
export function getRoleBasedRedirect(user: User | null): string {
  if (!user) {
    return "/admin/login";
  }

  switch (user.role) {
    case "admin":
      return "/admin";
    case "user":
      return "/user";
    default:
      return "/admin/login";
  }
}

/**
 * Check if the current user can perform an action on a resource
 */
export function canPerformAction(
  user: User | null,
  action: string,
  resource: string,
  resourceOwnerId?: string,
): boolean {
  if (!user) return false;

  // Build permission string
  const permission = `${action}:${resource}`;

  // Check specific permission
  if (hasPermission(user, permission)) {
    return true;
  }

  // Check if user can perform action on their own resources
  if (resourceOwnerId === user.id) {
    const ownPermission = `${action}:own`;
    return hasPermission(user, ownPermission);
  }

  // Check wildcard permission
  const wildcardPermission = `${action}:all`;
  return hasPermission(user, wildcardPermission);
}

/**
 * Get accessible features for a user
 */
export function getAccessibleFeatures(user: User | null): string[] {
  if (!user) return [];

  const features: Record<string, string[]> = {
    admin: [
      "dashboard",
      "flow-management",
      "lead-management",
      "user-management",
      "analytics",
      "settings",
      "loan-applications",
      "credit-cards",
      "insurance",
      "financial-tools",
    ],
    user: [
      "loan-applications",
      "credit-cards",
      "insurance",
      "financial-tools",
      "profile",
    ],
  };

  return features[user.role] || [];
}
