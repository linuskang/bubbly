"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function SettingsPanel({ onClose }: { onClose?: () => void }) {
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
    onClose?.()
  }

  if (!user) return <p className="p-6 text-muted-foreground">Loading...</p>

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
      <div className="relative bg-white rounded-2xl shadow-lg max-w-2xl w-full overflow-y-auto max-h-[90vh]">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          ✕
        </Button>

        <div className="p-6 space-y-8">
          {/* Profile Card */}
          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              {feedback && (
                <p className={`text-sm font-medium ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {feedback.message}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className="ml-auto" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={handleDelete} variant="destructive" className="ml-2">
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
