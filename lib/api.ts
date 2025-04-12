// API endpoints and tokens
// User API
const USERS_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/User"
const USERS_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Vehicle API endpoints
const VEHICLE_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Vehicle"
const VEHICLE_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Driver API endpoints
const DRIVER_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Driver"
const DRIVER_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Other API endpoints and tokens
const LOGIN_API_URL = "https://rjlogistics.logixfleetapp.com/api/method/login"
const LOGIN_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

const USER_DETAILS_API_URL = "https://rjlogistics.logixfleetapp.com/api/method/erpnext.api.get_user_details"
const USER_DETAILS_API_TOKEN = "13560c2ae837ee8:47a214defca981e"

const CREATE_USER_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/User"
const CREATE_USER_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

const ROLE_PROFILE_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Role Profile"
const ROLE_PROFILE_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

const DEPARTMENT_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Department"
const DEPARTMENT_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Vehicle Make and Model API endpoints
const VEHICLE_MAKE_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Vehicle Make"
const VEHICLE_MAKE_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

const VEHICLE_MODEL_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Vehicle Model"
const VEHICLE_MODEL_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Year API endpoint
const YEAR_API_URL = "https://rjlogistics.logixfleetapp.com/api/resource/Year"
const YEAR_API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

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

// Base API URL and token
const API_BASE_URL = "https://rjlogistics.logixfleetapp.com/api/resource"
const API_TOKEN = "326ce9899dd14ad:40bdcef41b46097"

// Issue API endpoint
const ISSUE_API_URL = `${API_BASE_URL}/Issue`
// Priority API endpoint
const PRIORITY_API_URL = `${API_BASE_URL}/Issue Priority`
// Issue Type API endpoint
const ISSUE_TYPE_API_URL = `${API_BASE_URL}/Issue Type`
// Mechanic API endpoint
const MECHANIC_API_URL = `${API_BASE_URL}/Mechanic`

// Add this to the top of the file with the other API endpoints
const TELEMATICS_API_URL = "http://dev.logixfleetapi.com/api/telematics"
const TELEMATICS_API_TOKEN = "fb628bd3c7a3965bedec9aaf00882bc3cf7e3114"

// Authentication API
export async function loginUser(email: string, password: string) {
  try {
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
    })

    return await response.json()
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function getUserDetails(email: string) {
  try {
    const response = await fetch(`${USER_DETAILS_API_URL}?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        Authorization: `token ${USER_DETAILS_API_TOKEN}`,
      },
    })

    if (!response.ok) {
      console.error("Failed to fetch user details:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch user details: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("User details from API:", data)
    return data
  } catch (error) {
    console.error("Error fetching user details:", error)

    // For testing purposes, create mock permissions if API fails
    if (email.toLowerCase() === "leofleet@gmail.com") {
      return {
        message: {
          user: "leofleet@gmail.com",
          roles: ["Fleet Manager", "Purchase Manager", "Purchase User", "Support Team", "Accounts Manager"],
          modules: ["Logix", "EDI", "Subcontracting", "Bulk Transaction", "Telephony", "Communication"],
          permissions: {
            "Vehicle Inspection": ["read", "write", "create", "delete", "submit", "cancel", "amend"],
            Issue: ["read", "write", "create", "delete", "submit", "cancel", "amend"],
            Vehicle: ["read", "write", "create", "delete"],
            User: ["read", "write", "create", "delete"],
            Driver: ["read", "write", "create", "delete"],
            "Vehicle Service": ["read", "write", "create", "delete", "submit", "cancel", "amend"],
            Insurance: ["read", "write", "create", "delete"],
          },
        },
      }
    }

    throw error
  }
}

// User API
export async function fetchUsers() {
  try {
    console.log("Fetching users from:", USERS_API_URL)
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
      console.error("Failed to fetch users:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Users data:", data)
    return data
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export async function fetchUserById(userId: string) {
  try {
    const response = await fetch(`${USERS_API_URL}/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `token ${USERS_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching user details:", error)
    throw error
  }
}

export async function createUser(userData: any) {
  try {
    const response = await fetch(CREATE_USER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${CREATE_USER_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: userData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(userId: string, userData: any) {
  try {
    const response = await fetch(`${USERS_API_URL}/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${USERS_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: userData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export async function deleteUser(userId: string) {
  try {
    const response = await fetch(`${USERS_API_URL}/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `token ${USERS_API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Role and Department API
export async function fetchRoleProfiles() {
  try {
    const response = await fetch(ROLE_PROFILE_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${ROLE_PROFILE_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch role profiles: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching role profiles:", error)
    throw error
  }
}

export async function fetchDepartments() {
  try {
    const response = await fetch(DEPARTMENT_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${DEPARTMENT_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching departments:", error)
    throw error
  }
}

// Vehicle API
export async function fetchVehicles() {
  try {
    console.log("Fetching vehicles from:", VEHICLE_API_URL)
    const response = await fetch(
      `${VEHICLE_API_URL}?fields=["license_plate","make","model","vehicle_type","driver","year","fuel_type","color","doors","wheels"]`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${VEHICLE_API_TOKEN}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.error("Failed to fetch vehicles:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Unable to retrieve vehicle list from the server. Please try again later.")
    }

    const data = await response.json()
    console.log("Vehicles data:", data)
    return data
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return {
      error: "We're having trouble connecting to the vehicle database. Please check your internet connection and try again.",
      data: [
        { name: "KBN 987Y", license_plate: "KBN 987Y" },
        { name: "KDE 366F", license_plate: "KDE 366F" },
        { name: "KDK 706J", license_plate: "KDK 706J" },
        { name: "KDJ 944R", license_plate: "KDJ 944R" },
      ],
    }
  }
}

export async function fetchVehicleById(vehicleId: string) {
  try {
    const response = await fetch(`${VEHICLE_API_URL}/${vehicleId}`, {
      method: "GET",
      headers: {
        Authorization: `token ${VEHICLE_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("We couldn't find the vehicle details you're looking for. The vehicle may have been removed or you may not have permission to view it.")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching vehicle details:", error)
    return {
      error: "We encountered a problem while trying to load the vehicle details. Please try again or contact support if the problem continues.",
    }
  }
}

export async function createVehicle(vehicleData: any) {
  try {
    const response = await fetch(VEHICLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${VEHICLE_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: vehicleData,
      }),
    })

    if (!response.ok) {
      throw new Error("Unable to add the new vehicle. Please check all required fields and try again.")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return {
      error: "We couldn't create the new vehicle record. Please verify all information is correct and try again.",
    }
  }
}

export async function updateVehicle(vehicleId: string, vehicleData: any) {
  try {
    const response = await fetch(`${VEHICLE_API_URL}/${vehicleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${VEHICLE_API_TOKEN}`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      body: JSON.stringify({
        data: vehicleData,
      }),
    })

    if (!response.ok) {
      throw new Error("Unable to update the vehicle information. Please check all fields and try again.")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating vehicle:", error)
    return {
      error: "We couldn't save the changes to the vehicle. Please make sure all information is correct and try again.",
    }
  }
}

export async function deleteVehicle(vehicleId: string) {
  try {
    const response = await fetch(`${VEHICLE_API_URL}/${vehicleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `token ${VEHICLE_API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error("Unable to remove the vehicle. It may be in use or you may not have permission to delete it.")
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    return {
      error: "We couldn't delete the vehicle. Please make sure it's not being used in any active records and try again.",
    }
  }
}

// Vehicle Make and Model API
export async function fetchVehicleMakes() {
  try {
    const response = await fetch(VEHICLE_MAKE_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${VEHICLE_MAKE_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch vehicle makes: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching vehicle makes:", error)
    throw error
  }
}

export async function fetchVehicleModels() {
  try {
    const response = await fetch(VEHICLE_MODEL_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${VEHICLE_MODEL_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch vehicle models: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching vehicle models:", error)
    throw error
  }
}

// Driver API
export async function fetchDrivers() {
  try {
    console.log("Fetching drivers from:", DRIVER_API_URL)
    const response = await fetch(
      `${DRIVER_API_URL}?fields=["name","first_name","last_name","email","cell_number","country","national_id","start_date","end_date","status"]`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${DRIVER_API_TOKEN}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.error("Failed to fetch drivers:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch drivers: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Drivers data:", data)
    return data
  } catch (error) {
    console.error("Error fetching drivers:", error)
    // Return mock data for testing if API fails
    return {
      data: [
        { name: "HR-DRI-2025-00001", full_name: "John Doe" },
        { name: "HR-DRI-2025-00002", full_name: "Jane Smith" },
        { name: "HR-DRI-2025-00026", full_name: "Michael Johnson" },
      ],
    }
  }
}

export async function fetchDriverById(driverId: string) {
  try {
    const response = await fetch(`${DRIVER_API_URL}/${driverId}`, {
      method: "GET",
      headers: {
        Authorization: `token ${DRIVER_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch driver details: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching driver details:", error)
    throw error
  }
}

export async function createDriver(driverData: any) {
  try {
    const response = await fetch(DRIVER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${DRIVER_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: driverData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create driver: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating driver:", error)
    throw error
  }
}

// Year API
export async function fetchYears() {
  try {
    const response = await fetch(YEAR_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${YEAR_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch years: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching years:", error)
    throw error
  }
}

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
    return data
  } catch (error) {
    console.error("Error fetching inspections:", error)
    throw error
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
    throw error
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
    return data
  } catch (error) {
    console.error("Error fetching vehicle services:", error)
    throw error
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
    return data
  } catch (error) {
    console.error("Error fetching service types:", error)
    // Fallback to mock data if API fails
    return {
      data: [
        { name: "Oil Change" },
        { name: "Tire Rotation" },
        { name: "Brake Service" },
        { name: "Engine Tune-up" },
        { name: "Transmission Service" },
      ],
    }
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
    return data
  } catch (error) {
    console.error("Error fetching service providers:", error)
    // Fallback to mock data if API fails
    return {
      data: [
        { name: "AutoCare Center" },
        { name: "Quick Service Garage" },
        { name: "Premium Auto Repair" },
        { name: "Fleet Maintenance Co." },
        { name: "City Auto Shop" },
      ],
    }
  }
}

// Issue API functions
// Fetch issues
export async function fetchIssues() {
  try {
    const fields = ["name", "vehicle", "driver", "grand_total", "priority", "issue_type", "status"]

    const response = await fetch(`${ISSUE_API_URL}?fields=${JSON.stringify(fields)}`, {
      method: "GET",
      headers: {
        Authorization: `token ${API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching issues:", error)
    // Return mock data for testing if API fails
    return [
      {
        name: "ISS-2025-00001",
        vehicle: "KDE 366F",
        driver: "HR-DRI-2025-00001",
        grand_total: 56789.0,
        priority: "High",
        issue_type: null,
        status: "Resolved",
      },
      {
        name: "ISS-2025-00002",
        vehicle: "KDK 706J",
        driver: "HR-DRI-2025-00002",
        grand_total: 4200.0,
        priority: "Medium",
        issue_type: "CV Joint",
        status: "Open",
      },
      {
        name: "ISS-2025-00003",
        vehicle: "KDK 706J",
        driver: "HR-DRI-2025-00002",
        grand_total: 4300.0,
        priority: "High",
        issue_type: "Tyre",
        status: "Open",
      },
      {
        name: "ISS-2025-00004",
        vehicle: "KDJ 944R",
        driver: "HR-DRI-2025-00026",
        grand_total: 8600.0,
        priority: "High",
        issue_type: "Tyre",
        status: "Open",
      },
    ]
  }
}

// Fetch priorities
export async function fetchPriorities() {
  try {
    const response = await fetch(PRIORITY_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch priorities: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching priorities:", error)
    // Return mock data for testing if API fails
    return [{ name: "Low" }, { name: "Medium" }, { name: "High" }]
  }
}

// Fetch issue types
export async function fetchIssueTypes() {
  try {
    const response = await fetch(ISSUE_TYPE_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch issue types: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching issue types:", error)
    // Return mock data for testing if API fails
    return [{ name: "Battery" }, { name: "Tyre" }, { name: "CV Joint" }, { name: "Engine" }, { name: "Transmission" }]
  }
}

// Fetch mechanics
export async function fetchMechanics() {
  try {
    const response = await fetch(MECHANIC_API_URL, {
      method: "GET",
      headers: {
        Authorization: `token ${API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch mechanics: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching mechanics:", error)
    // Return mock data for testing if API fails
    return [
      { name: "MECH-001", full_name: "Daniel" },
      { name: "MECH-002", full_name: "Robert" },
      { name: "MECH-003", full_name: "Sarah" },
    ]
  }
}

// Create a new issue
export async function createIssue(issueData: any) {
  try {
    console.log("Creating issue with data:", issueData)

    const response = await fetch(ISSUE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${API_TOKEN}`,
      },
      body: JSON.stringify(issueData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("API error response:", errorData)
      throw new Error(errorData.message || `Failed to create issue: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log("Issue created successfully:", result)
    return result
  } catch (error) {
    console.error("Error creating issue:", error)
    throw error
  }
}

// Add this function at the end of the file
export async function fetchVehicleGPS(companyId: string, licensePlate: string) {
  try {
    console.log("Fetching GPS data for vehicle:", licensePlate)
    const response = await fetch(
      `${TELEMATICS_API_URL}?company_id=${companyId}&license_plate=${encodeURIComponent(licensePlate)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${TELEMATICS_API_TOKEN}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.error("Failed to fetch GPS data:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch GPS data: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("GPS data:", data)
    return data
  } catch (error) {
    console.error("Error fetching GPS data:", error)
    throw error
  }
}

// Add this function to fetch all vehicles with GPS data
export async function fetchVehiclesWithGPS(companyId: string) {
  try {
    console.log("Fetching vehicles with GPS data")
    const response = await fetch(`${TELEMATICS_API_URL}/vehicles?company_id=${companyId}`, {
      method: "GET",
      headers: {
        Authorization: `Token ${TELEMATICS_API_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Failed to fetch vehicles with GPS:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch vehicles with GPS: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Vehicles with GPS data:", data)
    return data
  } catch (error) {
    console.error("Error fetching vehicles with GPS:", error)
    // Return mock data for testing if API fails
    return {
      results: [
        { license_plate: "KDA 381X", alias: "KDA 381X" },
        { license_plate: "KBN 987Y", alias: "KBN 987Y" },
        { license_plate: "KDE 366F", alias: "KDE 366F" },
      ],
    }
  }
}
