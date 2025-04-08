import { ProfileForm } from "@/components/profile-form"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">Profile</h3>
        <p className="text-muted-foreground">Manage your account settings and profile information.</p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  )
}

