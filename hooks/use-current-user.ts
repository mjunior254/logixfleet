"use client"

import { useState, useEffect } from "react"

// Updated type definition to include permissions
type User = {
  id: string
  name: string
  email: string
  role: string
  roles?: string[]
  permissions?: {
    [module: string]: string[]
  }
}

// Mock users for client-side components
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
    },
  },
]

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the current user from an API
    // This is a mock implementation that simulates getting the user from cookies
    const userId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_id="))
      ?.split("=")[1]

    if (userId) {
      // Try to get user data from cookie
      const userDataCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_data="))
        ?.split("=")[1]

      if (userDataCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userDataCookie))
          setUser(userData)
          return
        } catch (e) {
          console.error("Error parsing user data:", e)
        }
      }

      // Fallback to mock users
      const user = mockUsers.find((u) => u.id === userId)
      setUser(user || null)
    }
  }, [])

  return user
}
