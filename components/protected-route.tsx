"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { Permission } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface ProtectedRouteProps {
  module: string
  permission: Permission | Permission[]
  redirectTo?: string
  children: React.ReactNode
}

export function ProtectedRoute({ module, permission, redirectTo = "/dashboard", children }: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const hasAccess = Array.isArray(permission) ? hasAnyPermission(module, permission) : hasPermission(module, permission)

  useEffect(() => {
    if (isLoading) return

    if (!hasAccess) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this page",
      })
      router.push(redirectTo)
    }
  }, [hasAccess, isLoading, redirectTo, router, toast])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}
