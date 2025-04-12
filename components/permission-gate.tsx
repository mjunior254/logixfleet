"use client"

import type { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import type { Permission } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lock } from "lucide-react"

interface PermissionGateProps {
  docType: string
  permission: Permission | Permission[]
  fallback?: ReactNode
  children: ReactNode
  showAlert?: boolean
}

export function PermissionGate({
  docType,
  permission,
  fallback = null,
  children,
  showAlert = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = usePermissions()

  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(docType, permission)
    : hasPermission(docType, permission)

  if (!hasAccess) {
    if (showAlert) {
      return (
        <Alert variant="destructive" className="mb-4">
          <Lock className="h-4 w-4 mr-2" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to {Array.isArray(permission) ? permission.join(" or ") : permission} {docType}.
          </AlertDescription>
        </Alert>
      )
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}
