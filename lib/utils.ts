import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random password
export function generatePassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
  let password = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  return password
}

// Send password to user's email
export async function sendPasswordEmail(email: string, password: string) {
  // In a real application, you would use an email service like SendGrid, Mailgun, etc.
  console.log(`Sending password ${password} to ${email}`)

  // This is a mock implementation
  return new Promise((resolve) => {
    setTimeout(resolve, 1000)
  })
}
