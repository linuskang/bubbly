"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Loader2, CheckCircle, Droplet } from "lucide-react"
import { signIn } from "next-auth/react"

interface MagicLinkPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function MagicLinkPopup({ isOpen, onClose }: MagicLinkPopupProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: window.location.href,
      })

      if (result?.error) {
        setError("Failed to send magic link. Please try again.")
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setIsLoading(false)
    setIsSuccess(false)
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplet className="w-6 h-6 text-blue-600 fill-current" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to Bubbly</h2>
          <p className="text-gray-600 text-sm">Enter your email to continue</p>
        </div>

        {isSuccess ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email!</h3>
            <p className="text-gray-600 text-sm mb-4">
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <Button onClick={handleClose} className="w-full cursor-pointer">
              Got it
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
              />
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

            <Button type="submit" className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                "Send magic link"
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to the Terms and Privacy Policy.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
