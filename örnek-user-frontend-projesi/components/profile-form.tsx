"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  name: z.string().optional(),
  bio: z.string().max(160).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "johndoe",
      email: "john.doe@example.com",
      name: "John Doe",
      bio: "Film enthusiast and reviewer. I love sci-fi and drama movies.",
    },
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src="http://localhost:3000/uploads/1744059923208.jpg" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center">
                <h3 className="font-medium text-lg">John Doe</h3>
                <p className="text-sm text-muted-foreground">@johndoe</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isUploading}
                onClick={() => {
                  // This would normally open a file picker
                  setIsUploading(true)
                  setTimeout(() => {
                    setIsUploading(false)
                    toast({
                      title: "Profile picture updated",
                      description: "Your profile picture has been updated successfully.",
                    })
                  }, 1500)
                }}
              >
                {isUploading ? "Uploading..." : "Change Profile Picture"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name. It can only contain letters, numbers, and underscores.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your email address is used for notifications and account recovery.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>Your full name will be displayed on your profile.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
                    </FormControl>
                    <FormDescription>Brief description for your profile. Maximum 160 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">Update profile</Button>
          </form>
        </Form>
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Password</h3>
        <p className="text-sm text-muted-foreground">Change your password to keep your account secure.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel>Current Password</FormLabel>
            <Input type="password" />
          </div>
          <div className="space-y-2">
            <FormLabel>New Password</FormLabel>
            <Input type="password" />
          </div>
        </div>
        <Button>Change Password</Button>
      </div>
    </div>
  )
}

