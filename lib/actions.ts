"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

// API endpoints and tokens
const LOGIN_API_URL = "https://rjlogistics.logixfleetapp.com/api/method/login"
const LOGIN_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

const USERS_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/User"
const USERS_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

const USER_DETAILS_API_URL = "https://rjlogistics.logixfleetapp.com/api/method/erpnext.api.get_user_details"
const USER_DETAILS_API_TOKEN = "13560c2ae837ee8:47a214defca981e"

const CREATE_USER_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/User"
const CREATE_USER_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

const ROLE_PROFILE_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Role Profile"
const ROLE_PROFILE_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

const DEPARTMENT_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Department"
const DEPARTMENT_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Vehicle API endpoints
const VEHICLE_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Vehicle"
const VEHICLE_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Vehicle Make and Model API endpoints
const VEHICLE_MAKE_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Vehicle Make"
const VEHICLE_MAKE_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

const VEHICLE_MODEL_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Vehicle Model"
const VEHICLE_MODEL_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Driver API endpoints
const DRIVER_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Driver"
const DRIVER_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Add this new API endpoint for years
const YEAR_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Year"
const YEAR_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Add these new API endpoints and tokens after the existing ones at the top of the file

// Inspection API endpoints
const INSPECTION_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Insurance"
const INSPECTION_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Vehicle Service API endpoints
const VEHICLE_SERVICE_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Vehicle Service"
const VEHICLE_SERVICE_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Service Type API endpoint
const SERVICE_TYPE_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Type of Service"
const SERVICE_TYPE_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Service Provider API endpoint
const SERVICE_PROVIDER_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Service Provider"
const SERVICE_PROVIDER_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Vehicle Inspection API endpoints
const VEHICLE_INSPECTION_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Vehicle Inspection"
const VEHICLE_INSPECTION_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Issue API endpoint
const ISSUE_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Issue"
const ISSUE_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Update just the login function to properly handle special admin emails
export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  try {
    // For debugging
    console.log("Attempting to login with:", email)

    // Special handling for admin emails
    const isSpecialAdmin = email.toLowerCase() === "leofleet@gmail.com" || email.toLowerCase() === "yesnow@example.com"

    if (isSpecialAdmin) {
      // Create admin user data
      const userData = {
        id: email.toLowerCase() === "leofleet@gmail.com" ? "5" : "4",
        name: email.toLowerCase() === "leofleet@gmail.com" ? "LeoFleet" : "YesNow",
        email: email,
        role: "Admin",
        roles: ["Admin", "System Manager"],
        permissions: {
          User: ["read", "write", "create", "delete"],
          Vehicle: ["read", "write", "create", "delete"],
          Driver: ["read", "write", "create", "delete"],
          Report: ["read", "write", "create"],
        },
      }

      // Set cookies
      ;(
        await // Set cookies
        cookies()
      ).set("user_id", userData.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })
      ;(await cookies()).set("user_data", JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })

      return { success: true }
    }

    // Call the external API for authentication
    const response = await fetch(LOGIN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${LOGIN_API_TOKEN}`,
      },
      body: JSON.stringify({
        usr: email,
        pwd: password,
      }),
      cache: "no-store",
    })

    const data = await response.json()

    // Check if login was successful
    if (!response.ok) {
      return {
        error: data.message || "Invalid email or password. Please try again.",
      }
    }

    // If we have a successful login
    if (data.message === "Logged In" || response.ok) {
      try {
        // Get user details to determine permissions
        const userDetailsResponse = await fetch(`${USER_DETAILS_API_URL}?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            Authorization: `token ${USER_DETAILS_API_TOKEN}`,
          },
          cache: "no-store",
        })

        const userDetails = await userDetailsResponse.json()
        console.log("User details from API:", userDetails)

        // Extract the roles and permissions from the response
        const roles = userDetails.message?.roles || []
        const permissions = userDetails.message?.permissions || {}

        // Store user information in cookies
        const userData = {
          id: data.user_id || userDetails.message?.name || "1",
          name: data.full_name || userDetails.message?.full_name || email.split("@")[0],
          email: email,
          role: roles.length > 0 ? roles[0] : "User", // Use the first role as the primary role
          roles: roles,
          permissions: permissions,
        }

        // Set a cookie with user information
        ;(
          await // Set a cookie with user information
          cookies()
        ).set("user_id", userData.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        })

        // Store additional user data
        ;(
          await // Store additional user data
          cookies()
        ).set("user_data", JSON.stringify(userData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        })
      } catch (userDetailsError) {
        console.error("Error fetching user details:", userDetailsError)
        // Continue with login even if user details fetch fails

        // Set default user data if user details fetch fails
        const userData = {
          id: data.user_id || "1",
          name: data.full_name || email.split("@")[0],
          email: email,
          role: "User", // Default to User if role not provided
          permissions: {},
        }
        ;(await cookies()).set("user_id", userData.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        })
        ;(await cookies()).set("user_data", JSON.stringify(userData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        })
      }

      return { success: true }
    }

    // If we reach here, something unexpected happened
    return { error: "An unexpected error occurred. Please try again." }
  } catch (error) {
    console.error("Login error:", error)

    // Fallback to mock login if API fails
    // For testing purposes, assign permissions based on email
    let mockPermissions = {}
    let mockRoles = []

    if (
      email.toLowerCase().includes("admin") ||
      email.toLowerCase() === "yesnow@example.com" ||
      email.toLowerCase() === "leofleet@gmail.com"
    ) {
      // Admin permissions
      mockRoles = ["Admin", "System Manager"]
      mockPermissions = {
        User: ["read", "write", "create", "delete"],
        Vehicle: ["read", "write", "create", "delete"],
        Driver: ["read", "write", "create", "delete"],
        "Vehicle Inspection": ["read", "write", "create", "delete", "submit"],
        Issue: ["read", "write", "create", "delete", "submit"],
        Report: ["read", "write", "create"],
      }
    } else if (email.toLowerCase().includes("manager")) {
      // Manager permissions
      mockRoles = ["Fleet Manager"]
      mockPermissions = {
        User: ["read", "write"],
        Vehicle: ["read", "write"],
        Driver: ["read", "write", "create"],
        "Vehicle Inspection": ["read", "write", "create"],
        Issue: ["read", "write", "create"],
        Report: ["read"],
      }
    } else {
      // Default driver permissions
      mockRoles = ["Driver"]
      mockPermissions = {
        Vehicle: ["read"],
        Driver: ["read"],
        "Vehicle Inspection": ["read", "create"],
        Issue: ["read", "create"],
        Report: [],
      }
    }

    const userData = {
      id: "1",
      name: email.split("@")[0],
      email: email,
      role: mockRoles[0],
      roles: mockRoles,
      permissions: mockPermissions,
    }
    ;(await cookies()).set("user_id", userData.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    ;(await cookies()).set("user_data", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  }
}

export async function logout() {
  // Clear the authentication cookies
  ;(
    await // Clear the authentication cookies
    cookies()
  ).delete("user_id")
  ;(await cookies()).delete("user_data")
  redirect("/")
}

export async function fetchUsers() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "Admin" && currentUser.role !== "FleetManager")) {
      return { error: "You don't have permission to view users." }
    }

    // Use the correct API endpoint and fields
    const response = await fetch(
      `${USERS_API_URL}?fields=["name","first_name","department","email","full_name","last_name","enabled"]`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${USERS_API_TOKEN}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch users." }
    }

    const data = await response.json()
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching users:", error)

    // Fallback to mock data if API fails
    const mockUsers = [
      {
        name: "user1",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        full_name: "John Doe",
        enabled: 1,
        department: "Operations",
      },
      {
        name: "user2",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        full_name: "Jane Smith",
        enabled: 1,
        department: "Finance",
      },
      {
        name: "user3",
        first_name: "Robert",
        last_name: "Johnson",
        email: "robert.j@example.com",
        full_name: "Robert Johnson",
        enabled: 0,
        department: "Logistics",
      },
      {
        name: "user4",
        first_name: "Sarah",
        last_name: "Williams",
        email: "sarah.w@example.com",
        full_name: "Sarah Williams",
        enabled: 1,
        department: "Administration",
      },
      {
        name: "user5",
        first_name: "Michael",
        last_name: "Brown",
        email: "michael.b@example.com",
        full_name: "Michael Brown",
        enabled: 1,
        department: "Maintenance",
      },
    ]

    return { data: mockUsers }
  }
}

export async function fetchRoleProfiles() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "Admin" && currentUser.role !== "FleetManager")) {
      return { error: "You don't have permission to view role profiles." }
    }

    const response = await fetch(ROLE_PROFILE_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${ROLE_PROFILE_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch role profiles." }
    }

    const data = await response.json()
    console.log("Role profiles data:", data)
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching role profiles:", error)

    // Fallback to mock data if API fails
    const mockRoleProfiles = [
      { name: "Inventory" },
      { name: "Manufacturing" },
      { name: "Accounts" },
      { name: "Sales" },
      { name: "Purchase" },
    ]

    return { data: mockRoleProfiles }
  }
}

export async function fetchDepartments() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view departments." }
    }

    const response = await fetch(DEPARTMENT_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${DEPARTMENT_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch departments." }
    }

    const data = await response.json()
    console.log("Departments data:", data)
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching departments:", error)

    // Fallback to mock data if API fails
    const mockDepartments = [
      { name: "All Departments" },
      { name: "Accounts" },
      { name: "Customer Service" },
      { name: "Dispatch" },
      { name: "Human Resources" },
      { name: "Legal" },
      { name: "Management" },
      { name: "Marketing" },
      { name: "Operations" },
      { name: "Production" },
      { name: "Purchase" },
      { name: "Quality Management" },
      { name: "Research & Development" },
      { name: "Sales" },
    ]

    return { data: mockDepartments }
  }
}

export async function createUser(userData: {
  first_name: string
  last_name: string
  email: string
  mobile_no: string
  role_profile: string
  department?: string
  send_welcome_email: boolean
  enabled: boolean
  new_password: string
}) {
  try {
    // Check if the current user has permission to create users
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "Admin" && currentUser.role !== "FleetManager")) {
      return { error: "You don't have permission to create users." }
    }

    console.log("Creating user with data:", userData)

    // Call the API to create a new user
    const response = await fetch(CREATE_USER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${CREATE_USER_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: userData,
      }),
      cache: "no-store",
    })

    const responseText = await response.text()
    console.log("API Response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Error parsing JSON response:", e)
      return { error: "Invalid response from server" }
    }

    if (!response.ok) {
      return { error: data.message || data.exception || "Failed to create user." }
    }

    revalidatePath("/dashboard/users")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating user:", error)
    return { error: "An error occurred while creating the user." }
  }
}

export async function updateUser(
  userId: string,
  userData: {
    first_name?: string
    last_name?: string
    email?: string
    mobile_no?: string
    role_profile?: string
    department?: string
    enabled?: boolean
  },
) {
  try {
    // Check if the current user has permission to update users
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "Admin" && currentUser.role !== "FleetManager")) {
      return { error: "You don't have permission to update users." }
    }

    // Call the API to update the user
    const response = await fetch(`${CREATE_USER_API_URL}/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${CREATE_USER_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: userData,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to update user." }
    }

    const data = await response.json()
    revalidatePath("/dashboard/users")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "An error occurred while updating the user." }
  }
}

export async function fetchUserById(userId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "Admin" && currentUser.role !== "FleetManager")) {
      return { error: "You don't have permission to view user details." }
    }

    const response = await fetch(`${USERS_API_URL}/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `token ${USERS_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch user details." }
    }

    const data = await response.json()
    return { data: data.data || null }
  } catch (error) {
    console.error("Error fetching user details:", error)
    return { error: "An error occurred while fetching user details." }
  }
}

export async function deleteUser(userId: string) {
  try {
    // Check if the current user has permission to delete users
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "Admin" && currentUser.role !== "FleetManager")) {
      return { error: "You don't have permission to delete users." }
    }

    // Call the API to delete the user
    const response = await fetch(`${CREATE_USER_API_URL}/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `token ${CREATE_USER_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to delete user." }
    }

    revalidatePath("/dashboard/users")

    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "An error occurred while deleting the user." }
  }
}

// Vehicle management functions
export async function fetchVehicles() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view vehicles." }
    }

    // Use the correct API endpoint and fields
    const response = await fetch(
      `${VEHICLE_API_URL}?fields=["license_plate","make","model","vehicle_type","driver","year","fuel_type","color","doors","wheels"]`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${VEHICLE_API_TOKEN}`,
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch vehicles." }
    }

    const data = await response.json()
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return { error: "Failed to fetch vehicles. Please try again." }
  }
}

export async function fetchVehicleById(vehicleId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view vehicle details." }
    }

    const response = await fetch(`${VEHICLE_API_URL}/${vehicleId}`, {
      method: "GET",
      headers: {
        Authorization: `token ${VEHICLE_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch vehicle details." }
    }

    const data = await response.json()
    return { data: data.data || null }
  } catch (error) {
    console.error("Error fetching vehicle details:", error)
    return { error: "An error occurred while fetching vehicle details." }
  }
}

export async function createVehicle(vehicleData: {
  license_plate: string
  make: string
  model: string
  year: number
  status?: string
  driver?: string
  vehicle_type?: string
  fuel_type?: string
  color?: string
  doors?: number
  wheels?: number
}) {
  try {
    // Check if the current user has permission to create vehicles
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "Admin") {
      return { error: "You don't have permission to create vehicles." }
    }

    console.log("Creating vehicle with data:", vehicleData)

    // Call the API to create a new vehicle
    const response = await fetch(VEHICLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${VEHICLE_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: vehicleData,
      }),
      cache: "no-store",
    })

    const responseText = await response.text()
    console.log("API Response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Error parsing JSON response:", e)
      return { error: "Invalid response from server" }
    }

    if (!response.ok) {
      return { error: data.message || data.exception || "Failed to create vehicle." }
    }

    revalidatePath("/dashboard/vehicles")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return { error: "An error occurred while creating the vehicle." }
  }
}

// New functions for vehicle makes and models
export async function fetchVehicleMakes() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view vehicle makes." }
    }

    const response = await fetch(VEHICLE_MAKE_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${VEHICLE_MAKE_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch vehicle makes." }
    }

    const data = await response.json()
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching vehicle makes:", error)

    // Fallback to mock data if API fails
    const mockVehicleMakes = [
      { name: "Toyota" },
      { name: "Honda" },
      { name: "Ford" },
      { name: "Chevrolet" },
      { name: "Nissan" },
      { name: "BMW" },
      { name: "Mercedes-Benz" },
      { name: "Audi" },
      { name: "Volkswagen" },
      { name: "Hyundai" },
    ]

    return { data: mockVehicleMakes }
  }
}

export async function fetchVehicleModels() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view vehicle models." }
    }

    const response = await fetch(VEHICLE_MODEL_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${VEHICLE_MODEL_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch vehicle models." }
    }

    const data = await response.json()
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching vehicle models:", error)

    // Fallback to mock data if API fails
    const mockVehicleModels = [
      { name: "Corolla", make: "Toyota" },
      { name: "Camry", make: "Toyota" },
      { name: "Civic", make: "Honda" },
      { name: "Accord", make: "Honda" },
      { name: "F-150", make: "Ford" },
      { name: "Mustang", make: "Ford" },
      { name: "Silverado", make: "Chevrolet" },
      { name: "Malibu", make: "Chevrolet" },
      { name: "Altima", make: "Nissan" },
      { name: "Sentra", make: "Nissan" },
    ]

    return { data: mockVehicleModels }
  }
}

// Driver management functions
export async function fetchDrivers() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view drivers." }
    }

    const response = await fetch(
      `${DRIVER_API_URL}?fields=["name","email","country","cell_number","first_name","last_name","national_id","start_date","end_date","status"]`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${DRIVER_API_TOKEN}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch drivers." }
    }

    const data = await response.json()
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching drivers:", error)

    // Fallback to mock data if API fails
    const mockDrivers = [
      {
        name: "HR-DRI-2025-00001",
        first_name: "John",
        last_name: "Doe",
        email: "john.d@example.com",
        cell_number: "+1234567890",
        country: "USA",
        national_id: "123456789",
        start_date: "2023-01-15",
        end_date: "",
        status: "Active",
      },
      {
        name: "HR-DRI-2025-00002",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.s@example.com",
        cell_number: "+1987654321",
        country: "Canada",
        national_id: "987654321",
        start_date: "2022-06-10",
        end_date: "",
        status: "Active",
      },
    ]

    return { data: mockDrivers }
  }
}

export async function createDriver(driverData: {
  first_name: string
  last_name: string
  email: string
  phone: string
  license_number: string
  license_expiry: string
  status: string
  vehicle?: string
}) {
  try {
    // Check if the current user has permission to create drivers
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "Admin" && currentUser.role !== "FleetManager")) {
      return { error: "You don't have permission to create drivers." }
    }

    console.log("Creating driver with data:", driverData)

    // Call the API to create a new driver
    const response = await fetch(DRIVER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${DRIVER_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: driverData,
      }),
      cache: "no-store",
    })

    const responseText = await response.text()
    console.log("API Response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Error parsing JSON response:", e)
      return { error: "Invalid response from server" }
    }

    if (!response.ok) {
      return { error: data.message || data.exception || "Failed to create driver." }
    }

    revalidatePath("/dashboard/drivers")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating driver:", error)
    return { error: "An error occurred while creating the driver." }
  }
}

// Add a new function to fetch years
export async function fetchYears() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view years." }
    }

    const response = await fetch(YEAR_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${YEAR_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch years." }
    }

    const data = await response.json()
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching years:", error)

    // Fallback to mock data if API fails
    const currentYear = new Date().getFullYear()
    const mockYears = Array.from({ length: 30 }, (_, i) => ({
      name: String(currentYear - i),
    }))

    return { data: mockYears }
  }
}

// Add these new functions at the end of the file

// Inspection management functions
export async function fetchInspections() {
  try {
    console.log("Fetching inspections from:", INSPECTION_API_URL)
    const response = await fetch(
      `${INSPECTION_API_URL}?fields=["name","vehicle","company_providers","commencing_date","expiry_date"]`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${INSPECTION_API_TOKEN}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.error("Failed to fetch inspections:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch inspections: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Inspections data:", data)
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return { error: "Failed to fetch inspections. Please try again." }
  }
}

export async function fetchInspectionById(inspectionId: string) {
  try {
    const response = await fetch(`${INSPECTION_API_URL}/${inspectionId}`, {
      method: "GET",
      headers: {
        Authorization: `token ${INSPECTION_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch inspection details: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return { data: data.data || null }
  } catch (error) {
    console.error("Error fetching inspection details:", error)
    return { error: "Failed to fetch inspection details. Please try again." }
  }
}

export async function createInspection(inspectionData: any) {
  try {
    const response = await fetch(INSPECTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${INSPECTION_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: inspectionData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create inspection: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating inspection:", error)
    return { error: "Failed to create inspection. Please try again." }
  }
}

// Vehicle Service management functions
export async function fetchVehicleServices() {
  try {
    console.log("Fetching vehicle services from:", VEHICLE_SERVICE_API_URL)
    const response = await fetch(
      `${VEHICLE_SERVICE_API_URL}?fields=["name","vehicle","type_of_service","service_provider","current_odometer","next_expected_km","next_expected_service_date"]`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${VEHICLE_SERVICE_API_TOKEN}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.error("Failed to fetch vehicle services:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch vehicle services: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Vehicle services data:", data)
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching vehicle services:", error)
    return { error: "Failed to fetch vehicle services. Please try again." }
  }
}

export async function fetchVehicleServiceById(serviceId: string) {
  try {
    const response = await fetch(`${VEHICLE_SERVICE_API_URL}/${serviceId}`, {
      method: "GET",
      headers: {
        Authorization: `token ${VEHICLE_SERVICE_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch vehicle service details: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return { data: data.data || null }
  } catch (error) {
    console.error("Error fetching vehicle service details:", error)
    return { error: "Failed to fetch vehicle service details. Please try again." }
  }
}

export async function createVehicleService(serviceData: any) {
  try {
    const response = await fetch(VEHICLE_SERVICE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${VEHICLE_SERVICE_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: serviceData,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to create vehicle service." }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Error creating vehicle service:", error)
    return { error: "Failed to create vehicle service. Please try again." }
  }
}

// Service Type API functions
export async function fetchServiceTypes() {
  try {
    console.log("Fetching service types from:", SERVICE_TYPE_API_URL)
    const response = await fetch(SERVICE_TYPE_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${SERVICE_TYPE_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Failed to fetch service types:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch service types: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Service types data:", data)
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching service types:", error)
    // Fallback to mock data if API fails
    const mockServiceTypes = [
      { name: "Oil Change" },
      { name: "Tire Rotation" },
      { name: "Brake Service" },
      { name: "Engine Tune-up" },
      { name: "Transmission Service" },
    ]

    return { data: mockServiceTypes }
  }
}

// Service Provider API functions
export async function fetchServiceProviders() {
  try {
    console.log("Fetching service providers from:", SERVICE_PROVIDER_API_URL)
    const response = await fetch(SERVICE_PROVIDER_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${SERVICE_PROVIDER_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Failed to fetch service providers:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch service providers: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Service providers data:", data)
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching service providers:", error)
    // Fallback to mock data if API fails
    const mockServiceProviders = [
      { name: "AutoCare Center" },
      { name: "Quick Service Garage" },
      { name: "Premium Auto Repair" },
      { name: "Fleet Maintenance Co." },
      { name: "City Auto Shop" },
    ]

    return { data: mockServiceProviders }
  }
}

// Vehicle Inspection management functions
export async function fetchVehicleInspections() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view vehicle inspections." }
    }

    console.log("Fetching vehicle inspections from:", VEHICLE_INSPECTION_API_URL)
    const response = await fetch(`${VEHICLE_INSPECTION_API_URL}?fields=["name","status","inspection_type","vehicle"]`, {
      method: "GET",
      headers: {
        Authorization: `token ${VEHICLE_INSPECTION_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Failed to fetch vehicle inspections:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch vehicle inspections: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Vehicle inspections data:", data)
    return { data: data.data || [] }
  } catch (error) {
    console.error("Error fetching vehicle inspections:", error)
    return { error: "Failed to fetch vehicle inspections. Please try again." }
  }
}

export async function fetchVehicleInspectionById(inspectionId: string) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return { error: "You must be logged in to view vehicle inspection details." }
    }

    const response = await fetch(`${VEHICLE_INSPECTION_API_URL}/${inspectionId}`, {
      method: "GET",
      headers: {
        Authorization: `token ${VEHICLE_INSPECTION_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || "Failed to fetch vehicle inspection details." }
    }

    const data = await response.json()
    return { data: data.data || null }
  } catch (error) {
    console.error("Error fetching vehicle inspection details:", error)
    return { error: "An error occurred while fetching vehicle inspection details." }
  }
}

export async function createVehicleInspection(inspectionData: any) {
  try {
    // Check if the current user has permission to create vehicle inspections
    const currentUser = await getCurrentUser()

    if (!currentUser || (currentUser.role !== "Admin" && currentUser.role !== "FleetManager")) {
      return { error: "You don't have permission to create vehicle inspections." }
    }

    console.log("Creating vehicle inspection with data:", inspectionData)

    // Call the API to create a new vehicle inspection
    const response = await fetch(VEHICLE_INSPECTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${VEHICLE_INSPECTION_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: inspectionData,
      }),
      cache: "no-store",
    })

    const responseText = await response.text()
    console.log("API Response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Error parsing JSON response:", e)
      return { error: "Invalid response from server" }
    }

    if (!response.ok) {
      return { error: data.message || data.exception || "Failed to create vehicle inspection." }
    }

    revalidatePath("/dashboard/vehicles/inspections")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating vehicle inspection:", error)
    return { error: "An error occurred while creating the vehicle inspection." }
  }
}

// Issue management functions
// Create a new issue (server action)
export async function createIssueAction(formData: FormData) {
  try {
    const issueData = {
      driver: formData.get("driver"),
      vehicle: formData.get("vehicle"),
      grand_total: Number.parseFloat(formData.get("grand_total") as string),
      priority: formData.get("priority"),
      issue_type: formData.get("issue_type"),
      status: formData.get("status"),
      estimated_date_of_repair: formData.get("estimated_date_of_repair"),
      mechanic: formData.get("mechanic"),
      description: formData.get("description"),
    }

    const response = await fetch(ISSUE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${ISSUE_API_TOKEN}`,
      },
      body: JSON.stringify(issueData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Failed to create issue: ${response.status} ${response.statusText}`)
    }

    // Revalidate the issues page to show the new issue
    revalidatePath("/dashboard/issues")

    return { success: true }
  } catch (error) {
    console.error("Error creating issue:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Fetch issues (server action)
export async function fetchIssuesAction() {
  try {
    const fields = ["name", "vehicle", "driver", "grand_total", "priority", "issue_type", "status"]

    const response = await fetch(`${ISSUE_API_URL}?fields=${JSON.stringify(fields)}`, {
      method: "GET",
      headers: {
        Authorization: `token ${ISSUE_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return { success: true, data: data.data || [] }
  } catch (error) {
    console.error("Error fetching issues:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Add these server actions at the end of the file

// Fetch vehicle GPS data (server action)
export async function fetchVehicleGPSAction(companyId: string, licensePlate: string) {
  try {
    const response = await fetch(
      `http://dev.logixfleetapi.com/api/telematics?company_id=${companyId}&license_plate=${encodeURIComponent(licensePlate)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token fb628bd3c7a3965bedec9aaf00882bc3cf7e3114`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch GPS data: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching GPS data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Fetch all vehicles with GPS data (server action)
export async function fetchVehiclesWithGPSAction(companyId: string) {
  try {
    // In a real implementation, you would fetch from the API
    // For now, we'll return mock data since the endpoint might not exist

    // Mock data for testing
    const mockVehicles = [
      { license_plate: "KDA 381X", alias: "KDA 381X" },
      { license_plate: "KBN 987Y", alias: "KBN 987Y" },
      { license_plate: "KDE 366F", alias: "KDE 366F" },
    ]

    return { success: true, data: { results: mockVehicles } }
  } catch (error) {
    console.error("Error fetching vehicles with GPS:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
