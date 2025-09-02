"use client"

import React, { useState, useEffect } from "react"
import type { Waypoint } from "@/types"
import type { Dispatch, SetStateAction } from "react"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  userId: string
  userName?: string
}

interface WaypointInfoPanelProps {
  selectedWaypoint: Waypoint
  setSelectedWaypoint: Dispatch<SetStateAction<Waypoint | null>>
  hideRedMarker: () => void
  currentUserId?: string
}

export default function WaypointInfoPanel({
  selectedWaypoint,
  setSelectedWaypoint,
  hideRedMarker,
  currentUserId,
}: WaypointInfoPanelProps) {
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState<number>(0)
  const [userReview, setUserReview] = useState<Review | null>(null)

  useEffect(() => {
    if (!selectedWaypoint?.id) return

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?bubblerId=${selectedWaypoint.id}`)
        if (!res.ok) throw new Error("Failed to fetch reviews")
        const data: Review[] = await res.json()
         const normalized: Review[] = data.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          userId: r.userId,
          userName: r.user?.username || "Anonymous",
        }))
        setReviews(normalized)

        if (data.length > 0) {
          const avg =
            data.reduce((sum, r) => sum + r.rating, 0) / data.length
          setAvgRating(avg)
        } else {
          setAvgRating(0)
        }

        const myReview = data.find((r) => r.userId === currentUserId) || null
        setUserReview(myReview)
      } catch (err: any) {
        console.error(err)
      }
    }

    fetchReviews()
  }, [selectedWaypoint?.id, currentUserId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (userReview) {
      setError("You can only post one review per bubbler.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bubblerId: selectedWaypoint.id,
          rating,
          comment,
        }),
      })

      if (!res.ok) throw new Error("Failed to submit review")

      const newReview: Review = await res.json()
      setReviews((prev) => [...prev, newReview])
      setUserReview(newReview)

      setSuccess("Review submitted!")
      setRating(0)
      setComment("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(reviewId: string) {
    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete review")

      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      if (userReview?.id === reviewId) setUserReview(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed top-0 left-0 z-5 h-full w-107 bg-white shadow-xl border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="font-bold text-blue-600 text-lg truncate">
          {selectedWaypoint.name || "Unknown"}
        </h3>
        <button
          className="text-gray-500 hover:text-gray-700 font-bold"
          onClick={() => {
            setSelectedWaypoint(null)
            hideRedMarker()
          }}
        >
          ×
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {selectedWaypoint.description && (
          <p>
            <strong>Description:</strong> {selectedWaypoint.description}
          </p>
        )}
        {selectedWaypoint.addedby && (
          <p>
            <strong>Added by:</strong> {selectedWaypoint.addedby}
          </p>
        )}
        {selectedWaypoint.verified !== undefined && (
          <p>
            <strong>Verified:</strong>{" "}
            {selectedWaypoint.verified ? "Yes" : "No"}
          </p>
        )}
        <p>
          <strong>Accessible:</strong>{" "}
          {selectedWaypoint.isaccessible ? "Yes" : "No"}
        </p>
        <p>
          <strong>Dog Friendly:</strong>{" "}
          {selectedWaypoint.dogfriendly ? "Yes" : "No"}
        </p>
        <p>
          <strong>Bottle Filler:</strong>{" "}
          {selectedWaypoint.hasbottlefiller ? "Yes" : "No"}
        </p>
        {selectedWaypoint.createdAt && (
          <p>
            <strong>Created at:</strong>{" "}
            {new Date(selectedWaypoint.createdAt).toLocaleString()}
          </p>
        )}

        {/* Reviews Summary */}
        <div className="mt-4">
          <h4 className="font-semibold text-lg">Reviews</h4>
          <p className="text-sm text-gray-600">
            Average rating:{" "}
            <span className="font-bold">{avgRating.toFixed(1)}</span>/5 (
            {reviews.length} reviews)
          </p>
        </div>

        {/* Review List */}
        <div className="space-y-3 mt-3">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="border rounded-md p-2 text-sm bg-gray-50"
              >
                <div className="flex justify-between">
                  <p className="font-semibold">{r.rating}★</p>
                  <span className="text-xs text-gray-500">
                    {r.userName || "Anonymous"}
                  </span>
                </div>
                {r.comment && <p>{r.comment}</p>}
                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
                {r.userId === currentUserId && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600 text-xs mt-1 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Form */}
      {!userReview && (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              >
                <option value={0} disabled>
                  Select rating
                </option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="Write your review..."
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
