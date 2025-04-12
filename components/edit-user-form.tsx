"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { updateUser } from "@/lib/api"
import { Loader2, ArrowLeft, Save, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  new_password: z.string().min(8, "Password must be at least 8 characters."),
})

interface EditUserFormProps {
  user: {
    name: string
    email: string
    first_name?: string
    last_name?: string
    full_name?: string
    enabled?: number
  }
}

export function EditUserForm({ user }: EditUserFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Create form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      new_password: "",
    },
  })

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)

    startTransition(async () => {
      try {
        // The API endpoint is https://rjlogistics.logixfleetapp.com/api/resource/User/user.email
        const result = await updateUser(user.email, values)

        if (result.error) {
          setError(result.error)
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
          })
          return
        }

        setIsSuccess(true)
        toast({
          title: "User updated",
          description: "The user's password has been updated successfully.",
          icon: <Check className="h-4 w-4 text-green-600" />,
        })

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push("/dashboard/users")
          router.refresh()
        }, 1000)
      } catch (error) {
        console.error("Error updating user:", error)
        setError("An unexpected error occurred. Please try again.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        })
      }
    })
  }

  return (
    <Card className="border-l-4 border-l-blue-600 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Edit User</h2>
            <p className="text-gray-500 mt-1">
              Update password for {user.full_name || `${user.first_name || ""} ${user.last_name || ""}`} ({user.email})
            </p>
          </div>
          <Button variant="outline" asChild size="sm" className="gap-1">
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              User updated successfully! Redirecting to users list...
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/users")}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-2" disabled={isPending || isSuccess}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update User
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
