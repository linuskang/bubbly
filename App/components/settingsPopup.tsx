"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { X, User, AtSign, FileText, ImageIcon, Save, Trash2, Loader2 } from "lucide-react"

export default function SettingsPanel({ onClose }: { onClose?: () => void }) {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [image, setImage] = useState("")
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [bio, setBio] = useState("")

  useEffect(() => {
    fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          setUser(data)
          setName(data.name ?? "")
          setUsername(data.username ?? "")
          setImage(data.image ?? "")
          setBio(data.bio ?? "")
        })
  }, [])

  async function handleSave() {
    setSaving(true)
    setFeedback(null)
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, image, bio }),
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-700 font-medium">Loading your settings...</p>
            </div>
          </div>
        </div>
    )

  return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
        <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 max-w-lg w-full max-h-[90vh] overflow-hidden">
          <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-6 right-6 z-10 hover:bg-slate-200/80 rounded-full h-10 w-10 transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-600" />
          </Button>

          <div className="p-8 space-y-8 overflow-y-auto max-h-[90vh]">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
                <p className="text-slate-600">Manage your account information and preferences</p>
              </div>

              <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                  <AvatarImage src={image || user.image || ""} />
                  <AvatarFallback className="bg-blue-500 text-white text-xl font-semibold">
                    {name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-slate-900 text-lg">{user.name}</h3>
                  <p className="text-slate-600 font-medium">@{user.username}</p>
                  <p className="text-slate-500 text-sm">{user.email}</p>
                  <p className="text-slate-400 text-xs">
                    Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    Display Name
                  </Label>
                  <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your display name"
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-400/20 h-12 px-4 transition-all duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-slate-500" />
                    Username
                  </Label>
                  <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-400/20 h-12 px-4 transition-all duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Bio
                  </Label>
                  <Input
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell people about yourself"
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-400/20 h-12 px-4 transition-all duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="image" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    Profile Image URL
                  </Label>
                  <Input
                      id="image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-400/20 h-12 px-4 transition-all duration-200"
                  />
                </div>
              </div>

              {feedback && (
                  <div
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          feedback.type === "success"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-red-50 border-red-200 text-red-700"
                      }`}
                  >
                    <p className="text-sm font-semibold">{feedback.message}</p>
                  </div>
              )}

              <div className="flex justify-center items-center pt-4 border-t border-slate-200">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white h-12 px-40 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                  {saving ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </div>
                  ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
