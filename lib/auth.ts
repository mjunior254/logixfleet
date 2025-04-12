import { cookies } from "next/headers"

export type UserPermission = {
  [module: string]: string[]
}

export type UserRole = string

export type User = {
  id: string
  name: string
  email: string
  role: string
  roles?: UserRole[]
  permissions?: UserPermission
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    return null
  }

  // Try to get user data from cookie
  const userData = cookieStore.get("user_data")?.value

  if (userData) {
    try {
      const parsedUser = JSON.parse(userData)

      // Special handling for admin emails
      if (
        parsedUser.email?.toLowerCase() === "leofleet@gmail.com" ||
        parsedUser.email?.toLowerCase() === "yesnow@example.com"
      ) {
        return {
          ...parsedUser,
          role: "Admin",
          roles: ["Admin", "System Manager"],
          permissions: {
            User: ["read", "write", "create", "delete"],
            Vehicle: ["read", "write", "create", "delete"],
            Driver: ["read", "write", "create", "delete"],
            Report: ["read", "write", "create"],
          },
        }
      }

      return parsedUser
    } catch (e) {
      console.error("Error parsing user data:", e)
    }
  }

  // Fallback to mock users if user data cookie is not available
  // In a real app, you would fetch the user from the database or API
  const mockUsers = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      roles: ["Admin", "System Manager"],
      permissions: {
        User: ["read", "write", "create", "delete"],
        Vehicle: ["read", "write", "create", "delete"],
        Driver: ["read", "write", "create", "delete"],
        Report: ["read", "write", "create"],
      },
    },
    {
      id: "2",
      name: "Fleet Manager",
      email: "manager@example.com",
      role: "FleetManager",
      roles: ["Fleet Manager"],
      permissions: {
        User: ["read"],
        Vehicle: ["read", "write"],
        Driver: ["read", "write", "create"],
        Report: ["read"],
      },
    },
    {
      id: "3",
      name: "Driver User",
      email: "driver@example.com",
      role: "Driver",
      roles: ["Driver"],
      permissions: {
        Vehicle: ["read"],
        Driver: ["read"],
        Report: [],
        User: [],
      },
    },
    {
      id: "4",
      name: "YesNow",
      email: "yesnow@example.com",
      role: "Admin",
      roles: ["Admin", "System Manager"],
      permissions: {
        User: ["read", "write", "create", "delete"],
        Vehicle: ["read", "write", "create", "delete"],
        Driver: ["read", "write", "create", "delete"],
        Report: ["read", "write", "create"],
      },
    },
    {
      id: "5",
      name: "LeoFleet",
      email: "leofleet@gmail.com",
      role: "Admin",
      roles: ["Admin", "System Manager"],
      permissions: {
        User: ["read", "write", "create", "delete"],
        Vehicle: ["read", "write", "create", "delete"],
        Driver: ["read", "write", "create", "delete"],
        Report: ["read", "write", "create"],
      },
    },
  ]

  const user = mockUsers.find((u) => u.id === userId)

  return user || null
}

// Helper function to check if a user has permission for a specific action
export function hasPermission(
  user: User | null,
  module: string,
  action: "read" | "write" | "create" | "delete" | "submit" | "cancel" | "amend",
): boolean {
  if (!user) return false

  // Special case for specific admin emails
  if (user.email?.toLowerCase() === "leofleet@gmail.com" || user.email?.toLowerCase() === "yesnow@example.com") {
    return true
  }

  // Admin role has all permissions
  if (user.role === "Admin" || (user.roles && user.roles.includes("Admin"))) {
    return true
  }

  // Check if user has the specific permission
  if (user.permissions && user.permissions[module]) {
    return user.permissions[module].includes(action)
  }

  return false
}
