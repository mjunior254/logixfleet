"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permissions"
import { Lock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Permission } from "@/contexts/auth-context"

type RestrictedButtonProps = React.ComponentProps<typeof Button> & {
  docType: string
  permission: Permission | Permission[]
  fallbackMessage?: string
  showAlert?: boolean
}

export function RestrictedButton({
  docType,
  permission,
  fallbackMessage = "You don't have permission to perform this action",
  showAlert = false,
  children,
  ...props
}: RestrictedButtonProps) {
  const { hasPermission, hasAnyPermission } = usePermissions()
  const [showErrorAlert, setShowErrorAlert] = useState(false)

  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(docType, permission)
    : hasPermission(docType, permission)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasAccess) {
      e.preventDefault()
      e.stopPropagation()
      if (showAlert) {
        setShowErrorAlert(true)
        setTimeout(() => setShowErrorAlert(false), 3000)
      }
      return
    }

    props.onClick?.(e)
  }

  // If user has access, render a normal button
  if (hasAccess) {
    return <Button {...props}>{children}</Button>
  }

  // If user doesn't have access, render a restricted button
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              {...props}
              onClick={handleClick}
              variant="outline"
              className="text-orange-500 border-orange-300 bg-orange-50 hover:bg-orange-100 hover:text-orange-600"
              disabled={props.disabled}
            >
              <Lock className="mr-2 h-4 w-4" />
              {children}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{fallbackMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showErrorAlert && showAlert && (
        <Alert
          variant="destructive"
          className="fixed bottom-4 right-4 w-96 z-50 animate-in fade-in slide-in-from-bottom-5"
        >
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{fallbackMessage}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
