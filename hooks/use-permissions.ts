"use client"

import { useAuth, type Permission } from "@/contexts/auth-context"

export function usePermissions() {
  const { hasPermission, hasAnyPermission, hasRole, user } = useAuth()

  return {
    // Document type permission checks
    hasPermission,
    hasAnyPermission,

    // Role checks
    hasRole,

    // Module checks
    hasModule: (module: string) => user?.modules?.includes(module) || false,

    // Common permission checks
    canRead: (docType: string) => hasPermission(docType, "read"),
    canWrite: (docType: string) => hasPermission(docType, "write"),
    canCreate: (docType: string) => hasPermission(docType, "create"),
    canDelete: (docType: string) => hasPermission(docType, "delete"),
    canSubmit: (docType: string) => hasPermission(docType, "submit"),
    canCancel: (docType: string) => hasPermission(docType, "cancel"),
    canAmend: (docType: string) => hasPermission(docType, "amend"),

    // Check if user can manage (create, write, or delete)
    canManage: (docType: string) => hasAnyPermission(docType, ["create", "write", "delete"]),

    // Get all document types the user has access to
    getAllDocTypes: () => (user ? Object.keys(user.permissions) : []),

    // Get all permissions for a specific document type
    getDocTypePermissions: (docType: string): Permission[] => user?.permissions[docType] || [],

    // Get all modules the user has access to
    getAllModules: () => user?.modules || [],

    // Get all roles the user has
    getAllRoles: () => user?.roles || [],
  }
}
