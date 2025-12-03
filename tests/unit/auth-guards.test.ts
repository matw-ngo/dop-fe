import { describe, it, expect } from "vitest";
import type { User } from "@/store/use-auth-store";
import {
  hasRole,
  isAdmin,
  isAuthenticated,
  hasAnyRole,
  hasAllRoles,
  getUserPermissions,
  hasPermission,
  canAccessRoute,
  getRoleBasedRedirect,
  canPerformAction,
  getAccessibleFeatures,
} from "@/lib/utils/auth-guards";

describe("Auth Guards Utilities", () => {
  const mockAdminUser: User = {
    id: "admin-1",
    username: "admin",
    email: "admin@example.com",
    role: "admin",
  };

  const mockRegularUser: User = {
    id: "user-1",
    username: "user",
    email: "user@example.com",
    role: "user",
  };

  describe("hasRole", () => {
    it("should return true when user has the specified role", () => {
      expect(hasRole(mockAdminUser, "admin")).toBe(true);
      expect(hasRole(mockRegularUser, "user")).toBe(true);
    });

    it("should return false when user does not have the specified role", () => {
      expect(hasRole(mockAdminUser, "user")).toBe(false);
      expect(hasRole(mockRegularUser, "admin")).toBe(false);
    });

    it("should return false for null user", () => {
      expect(hasRole(null, "admin")).toBe(false);
      expect(hasRole(null, "user")).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("should return true for admin users", () => {
      expect(isAdmin(mockAdminUser)).toBe(true);
    });

    it("should return false for non-admin users", () => {
      expect(isAdmin(mockRegularUser)).toBe(false);
    });

    it("should return false for null user", () => {
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe("isAuthenticated", () => {
    it("should return true for authenticated users", () => {
      expect(isAuthenticated(mockAdminUser)).toBe(true);
      expect(isAuthenticated(mockRegularUser)).toBe(true);
    });

    it("should return false for null user", () => {
      expect(isAuthenticated(null)).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("should return true when user has one of the specified roles", () => {
      expect(hasAnyRole(mockAdminUser, ["admin", "moderator"])).toBe(true);
      expect(hasAnyRole(mockRegularUser, ["admin", "user"])).toBe(true);
    });

    it("should return false when user has none of the specified roles", () => {
      expect(hasAnyRole(mockRegularUser, ["admin", "moderator"])).toBe(false);
      expect(hasAnyRole(mockAdminUser, ["moderator", "user"])).toBe(false);
    });

    it("should return false for null user", () => {
      expect(hasAnyRole(null, ["admin", "user"])).toBe(false);
    });
  });

  describe("hasAllRoles", () => {
    it("should return true when user has all specified roles (single role case)", () => {
      expect(hasAllRoles(mockAdminUser, ["admin"])).toBe(true);
      expect(hasAllRoles(mockRegularUser, ["user"])).toBe(true);
    });

    it("should return false when user does not have all specified roles", () => {
      // This is more complex for single-role users, but tests the logic
      expect(hasAllRoles(mockAdminUser, ["admin", "user"])).toBe(false);
      expect(hasAllRoles(mockRegularUser, ["user", "admin"])).toBe(false);
    });

    it("should return false for null user", () => {
      expect(hasAllRoles(null, ["admin"])).toBe(false);
    });
  });

  describe("getUserPermissions", () => {
    it("should return admin permissions for admin users", () => {
      const permissions = getUserPermissions(mockAdminUser);
      expect(permissions).toContain("read:all");
      expect(permissions).toContain("write:all");
      expect(permissions).toContain("delete:all");
      expect(permissions).toContain("manage:users");
      expect(permissions).toContain("manage:flows");
    });

    it("should return user permissions for regular users", () => {
      const permissions = getUserPermissions(mockRegularUser);
      expect(permissions).toContain("read:own");
      expect(permissions).toContain("write:own");
      expect(permissions).toContain("view:own-applications");
      expect(permissions).toContain("manage:own-profile");
    });

    it("should return empty array for null user", () => {
      const permissions = getUserPermissions(null);
      expect(permissions).toEqual([]);
    });
  });

  describe("hasPermission", () => {
    it("should return true for exact permission match", () => {
      expect(hasPermission(mockAdminUser, "read:all")).toBe(true);
      expect(hasPermission(mockRegularUser, "read:own")).toBe(true);
    });

    it("should return true for wildcard permission match", () => {
      expect(hasPermission(mockAdminUser, "read:any-resource")).toBe(true);
      expect(hasPermission(mockAdminUser, "write:unknown-resource")).toBe(true);
    });

    it("should return false for missing permission", () => {
      expect(hasPermission(mockRegularUser, "read:all")).toBe(false);
      expect(hasPermission(mockAdminUser, "read:nonexistent")).toBe(false);
    });

    it("should return false for null user", () => {
      expect(hasPermission(null, "read:all")).toBe(false);
      expect(hasPermission(null, "read:own")).toBe(false);
    });
  });

  describe("canAccessRoute", () => {
    it("should allow admin access to all admin routes", () => {
      expect(canAccessRoute(mockAdminUser, "/admin")).toBe(true);
      expect(canAccessRoute(mockAdminUser, "/admin/flows")).toBe(true);
      expect(canAccessRoute(mockAdminUser, "/admin/users")).toBe(true);
      expect(canAccessRoute(mockAdminUser, "/admin/analytics")).toBe(true);
    });

    it("should deny user access to admin routes", () => {
      expect(canAccessRoute(mockRegularUser, "/admin")).toBe(false);
      expect(canAccessRoute(mockRegularUser, "/admin/flows")).toBe(false);
      expect(canAccessRoute(mockRegularUser, "/admin/users")).toBe(false);
    });

    it("should deny access for null user", () => {
      expect(canAccessRoute(null, "/admin")).toBe(false);
      expect(canAccessRoute(null, "/admin/flows")).toBe(false);
    });

    it("should return false for unrecognized routes", () => {
      expect(canAccessRoute(mockAdminUser, "/unknown-route")).toBe(false);
    });
  });

  describe("getRoleBasedRedirect", () => {
    it("should return admin dashboard for admin users", () => {
      expect(getRoleBasedRedirect(mockAdminUser)).toBe("/admin");
    });

    it("should return user dashboard for regular users", () => {
      expect(getRoleBasedRedirect(mockRegularUser)).toBe("/user");
    });

    it("should return login page for null user", () => {
      expect(getRoleBasedRedirect(null)).toBe("/admin/login");
    });
  });

  describe("canPerformAction", () => {
    it("should allow admin to perform admin actions on any resource", () => {
      expect(canPerformAction(mockAdminUser, "read", "all")).toBe(true);
      expect(canPerformAction(mockAdminUser, "write", "all")).toBe(true);
      expect(canPerformAction(mockAdminUser, "delete", "all")).toBe(true);
      expect(canPerformAction(mockAdminUser, "manage", "users")).toBe(true);
    });

    it("should allow user to perform actions on their own resources", () => {
      expect(
        canPerformAction(mockRegularUser, "read", "own", "user-1")
      ).toBe(true);
      expect(
        canPerformAction(mockRegularUser, "write", "own", "user-1")
      ).toBe(true);
    });

    it("should deny user to perform actions on others' resources", () => {
      expect(
        canPerformAction(mockRegularUser, "read", "own", "user-2")
      ).toBe(false);
      expect(
        canPerformAction(mockRegularUser, "write", "own", "user-2")
      ).toBe(false);
    });

    it("should deny unauthorized actions", () => {
      expect(canPerformAction(mockRegularUser, "delete", "all")).toBe(false);
      expect(canPerformAction(mockRegularUser, "manage", "users")).toBe(false);
    });

    it("should return false for null user", () => {
      expect(canPerformAction(null, "read", "all")).toBe(false);
      expect(canPerformAction(null, "read", "own")).toBe(false);
    });
  });

  describe("getAccessibleFeatures", () => {
    it("should return all features for admin users", () => {
      const features = getAccessibleFeatures(mockAdminUser);
      expect(features).toContain("dashboard");
      expect(features).toContain("flow-management");
      expect(features).toContain("lead-management");
      expect(features).toContain("user-management");
      expect(features).toContain("analytics");
      expect(features).toContain("settings");
    });

    it("should return limited features for regular users", () => {
      const features = getAccessibleFeatures(mockRegularUser);
      expect(features).toContain("loan-applications");
      expect(features).toContain("credit-cards");
      expect(features).toContain("insurance");
      expect(features).toContain("financial-tools");
      expect(features).toContain("profile");
    });

    it("should not include admin features for regular users", () => {
      const features = getAccessibleFeatures(mockRegularUser);
      expect(features).not.toContain("dashboard");
      expect(features).not.toContain("flow-management");
      expect(features).not.toContain("lead-management");
      expect(features).not.toContain("user-management");
      expect(features).not.toContain("analytics");
    });

    it("should return empty array for null user", () => {
      const features = getAccessibleFeatures(null);
      expect(features).toEqual([]);
    });
  });
});