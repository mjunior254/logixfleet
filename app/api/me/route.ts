import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// API endpoints and tokens
const USER_DETAILS_API_URL = "https://rjlogistics.logixfleetapp.com/api/method/erpnext.api.get_user_details"
const USER_DETAILS_API_TOKEN = "13560c2ae837ee8:47a214defca981e"

export async function GET() {
  try {
    // Get the user ID from cookies
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value
    const userData = cookieStore.get("user_data")?.value

    if (!userId || !userData) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Parse user data
    let parsedUserData
    try {
      parsedUserData = JSON.parse(userData)
    } catch (parseError) {
      console.error("Error parsing user data from cookie:", parseError)
      return NextResponse.json({ error: "Invalid user data format" }, { status: 400 })
    }

    // Special handling for admin emails
    if (
      parsedUserData.email?.toLowerCase() === "leofleet@gmail.com" ||
      parsedUserData.email?.toLowerCase() === "yesnow@example.com"
    ) {
      const adminUserData = {
        ...parsedUserData,
        role: "Admin",
        roles: ["Admin", "System Manager"],
        permissions: {
          User: ["read", "write", "create", "delete"],
          Vehicle: ["read", "write", "create", "delete"],
          Driver: ["read", "write", "create", "delete"],
          Report: ["read", "write", "create"],
        },
      }

      // Update the user_data cookie
      cookieStore.set("user_data", JSON.stringify(adminUserData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })

      return NextResponse.json(adminUserData)
    }

    // Fetch fresh user details from API
    try {
      // Check if we have an email to fetch with
      if (!parsedUserData.email) {
        console.warn("No email in user data, skipping API fetch")
        return NextResponse.json(parsedUserData)
      }

      const userDetailsResponse = await fetch(
        `${USER_DETAILS_API_URL}?email=${encodeURIComponent(parsedUserData.email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `token ${USER_DETAILS_API_TOKEN}`,
          },
          cache: "no-store",
        },
      )

      if (!userDetailsResponse.ok) {
        console.warn(`API returned status ${userDetailsResponse.status}`)
        // If API call fails, return the existing user data
        return NextResponse.json(parsedUserData)
      }

      const userDetails = await userDetailsResponse.json()
      console.log("User details from API:", userDetails)

      // Extract roles and permissions from the API response
      const roles = userDetails.message?.roles || []
      const permissions = userDetails.message?.permissions || {}

      // Update the user data with fresh permissions
      const updatedUserData = {
        ...parsedUserData,
        role: roles.length > 0 ? roles[0] : parsedUserData.role,
        roles: roles,
        permissions: permissions,
      }

      // Update the user_data cookie
      cookieStore.set("user_data", JSON.stringify(updatedUserData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })

      return NextResponse.json(updatedUserData)
    } catch (error) {
      console.error("Error fetching fresh user details:", error)
      // Return the existing user data if API call fails
      return NextResponse.json(parsedUserData)
    }
  } catch (error) {
    console.error("Error in /api/me route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
