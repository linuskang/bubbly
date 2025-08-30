"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [image, setImage] = useState("")
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setName(data.name ?? "")
        setUsername(data.username ?? "")
        setImage(data.image ?? "")
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    setFeedback(null)

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, image }),
      })

      if (!res.ok) throw new Error("Failed to save changes")

      const updatedUser = await res.json()
      setUser(updatedUser)
      setFeedback({ type: "success", message: "Changes saved successfully!" })
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save changes. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return
    await fetch("/api/user/delete", { method: "DELETE" })
    // optionally redirect or signOut()
  }

  if (!user) return <p className="p-6 text-muted-foreground">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      {/* Profile Card */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={image || user.image || ""} />
              <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
            <p className="text-xs text-muted-foreground">
              Your username will be used in profile URLs like <code>waternearme.linus.id.au/user/{username || "username"}</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
          </div>

          {/* Feedback Message */}
          {feedback && (
            <p
              className={`text-sm font-medium ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {feedback.message}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="ml-auto" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your account is permanent and cannot be undone.
          </p>
          <Button onClick={handleDelete} variant="destructive" size="sm">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
