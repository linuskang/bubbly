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
        .then((res) => res.json())
        .then((data) => {
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

  if (!user)
    return (
        <div className="fixed inset-0 z-50 bg-black/20 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700">Loading...</p>
            </div>
          </div>
        </div>
    )

  return (
      <div className="fixed inset-0 z-50 bg-black/20 flex justify-center items-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
          <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[90vh]">
            <Card className="shadow-sm rounded-xl border border-gray-200">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900">Profile Settings</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={image || user.image || ""} />
                    <AvatarFallback className="bg-blue-600 text-white text-lg font-medium">
                      {name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{user.name} (@{user.username})</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Member since{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Display Name
                    </Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your display name"
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                      Username
                    </Label>
                    <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                      Profile Image URL
                    </Label>
                    <Input
                        id="image"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://example.com/avatar.png"
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {feedback && (
                    <div
                        className={`p-3 rounded-lg border ${
                            feedback.type === "success"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-red-50 border-red-200 text-red-700"
                        }`}
                    >
                      <p className="text-sm font-medium">{feedback.message}</p>
                    </div>
                )}
              </CardContent>

              <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <Button
                    onClick={handleDelete}
                    variant="outline"
                    className="rounded-lg border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  Delete Account
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-6"
                >
                  {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </div>
                  ) : (
                      "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
  )
}
