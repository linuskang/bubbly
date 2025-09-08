"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Waypoint } from "@/types"
import type { Dispatch, SetStateAction } from "react"
import Link from "next/link"

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

type TabType = "overview" | "reviews" | "amenities" | "history" | "photos" | "ai"

export default function WaypointInfoPanel({
                                            selectedWaypoint,
                                            setSelectedWaypoint,
                                            hideRedMarker,
                                            currentUserId,
                                          }: WaypointInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [showEditForm, setShowEditForm] = useState(false)

  // --- Reviews State ---
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState<number>(0)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [logs, setLogs] = useState<any[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 2

  useEffect(() => {
    if (!selectedWaypoint?.id) return

    async function fetchLogs() {
      try {
        const res = await fetch(`/api/waypoints/logs?bubblerId=${selectedWaypoint.id}`)
        if (!res.ok) throw new Error("Failed to fetch logs")
        const data = await res.json()
        setLogs(data)
      } catch (err: any) {
        console.error(err)
      }
    }

    fetchLogs()
  }, [selectedWaypoint?.id])

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
          userName: r.user?.username || "Unknown User",
        }))
        setReviews(normalized)

        if (data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
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

  const totalPages = Math.ceil(logs.length / logsPerPage)
  const startIndex = (currentPage - 1) * logsPerPage
  const paginatedLogs = logs.slice(startIndex, startIndex + logsPerPage)

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "reviews", label: "Reviews", badge: reviews.length },
    { id: "history", label: "Changes", badge: logs.length },
    { id: "ai", label: "Ask AI" },
  ]

  return (
      <div className="fixed top-20 left-5 z-10 w-96 bg-white shadow-xl rounded-2xl border border-gray-200 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
        <div className="relative">
          {selectedWaypoint.imageUrl && (
              <div className="w-full h-48 overflow-hidden rounded-t-2xl bg-gray-100 relative">
                <img
                    src={selectedWaypoint.imageUrl || "/placeholder.svg"}
                    alt={selectedWaypoint.name}
                    className="w-full h-full object-cover"
                />
              </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
                onClick={() => {
                  const url = `${window.location.origin}/?waypoint=${selectedWaypoint.id}`;
                  navigator.clipboard.writeText(url);
                  alert("Link copied!");
                }}
                className="p-2 bg-white/90 backdrop-blur-sm cursor-pointer rounded-full shadow-lg hover:bg-white transition-colors"
                title="Share"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </button>
            <button
                onClick={() => setShowEditForm((prev) => !prev)}
                className="p-2 bg-white/90 backdrop-blur-sm cursor-pointer rounded-full shadow-lg hover:bg-white transition-colors"
                title={showEditForm ? "Cancel Edit" : "Edit"}
            >
              <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
                />
              </svg>
            </button>
            <button
                onClick={() => {
                  const reason = prompt("Why report?");
                  if (!reason) return;
                  alert(`Reported: ${reason}`);
                }}
                className="p-2 bg-white/90 backdrop-blur-sm cursor-pointer rounded-full shadow-lg hover:bg-white transition-colors"
                title="Report"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  {selectedWaypoint.name || "Unknown Location"}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {avgRating > 0 && (
                      <>
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">
                        {avgRating.toFixed(1)} ({reviews.length})
                      </span>
                    </span>
                      </>
                  )}
                  {selectedWaypoint.verified && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                      </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 bg-white">
          <div className="flex">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 flex items-center justify-center gap-2 px-2 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{tab.badge}</span>
                  )}
                </button>
            ))}
          </div>
        </div>

        {showEditForm && (
            <EditBubblerForm
                selectedWaypoint={selectedWaypoint}
                setSelectedWaypoint={setSelectedWaypoint}
                hideForm={() => setShowEditForm(false)}
            />
        )}

        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && <OverviewTab selectedWaypoint={selectedWaypoint} />}

          {activeTab === "reviews" && (
              <ReviewsTab
                  reviews={reviews}
                  avgRating={avgRating}
                  userReview={userReview}
                  currentUserId={currentUserId}
                  rating={rating}
                  setRating={setRating}
                  comment={comment}
                  setComment={setComment}
                  loading={loading}
                  error={error}
                  success={success}
                  handleSubmit={handleSubmit}
                  handleDelete={handleDelete}
              />
          )}
          {activeTab === "ai" && (
              <AiTab selectedWaypoint={selectedWaypoint} />
          )}
          {activeTab === "history" && (
              <HistoryTab
                  logs={paginatedLogs}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
              />
          )}
        </div>
      </div>
  )
}

function OverviewTab({ selectedWaypoint }: { selectedWaypoint: Waypoint }) {
  const quickInfo = [
    { key: "isaccessible", label: "Accessible" },
    { key: "dogfriendly", label: "Dog Friendly" },
    { key: "hasbottlefiller", label: "Bottle Filler" },
  ].filter(({ key }) => selectedWaypoint[key as keyof Waypoint])

  const InfoBadge = ({ label }: { label: string }) => (
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              clipRule="evenodd"
          />
        </svg>
        <span className="text-gray-600">{label}</span>
      </div>
  )

  return (
      <div className="p-4 space-y-6">
        {selectedWaypoint.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700 leading-relaxed">{selectedWaypoint.description}</p>
            </div>
        )}

        {quickInfo.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {quickInfo.map(({ key, label }) => (
                    <InfoBadge key={key} label={label} />
                ))}
              </div>
            </div>
        )}

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium">ID:</span>
            <span>{selectedWaypoint.id}</span>
          </div>

          {selectedWaypoint.maintainer && (
              <div>
                Maintained by <strong className="text-gray-700">{selectedWaypoint.maintainer}</strong>
              </div>
          )}

          {selectedWaypoint.addedby && (
              <div>
                Added by{" "}
                <Link href={`/user/${selectedWaypoint.addedby}`} className="text-gray-700 font-bold hover:underline">
                  {selectedWaypoint.addedby}
                </Link>
              </div>
          )}

          {selectedWaypoint.createdAt && (
              <div>
                Added on{" "}
                <strong className="text-gray-700">{new Date(selectedWaypoint.createdAt).toLocaleDateString()}</strong>
              </div>
          )}

          {selectedWaypoint.updatedAt && (
              <div>
                Last updated on{" "}
                <strong className="text-gray-700">{new Date(selectedWaypoint.updatedAt).toLocaleDateString()}</strong>
              </div>
          )}
        </div>
      </div>
  )
}

function ReviewsTab({
                        reviews,
                        avgRating,
                        userReview,
                        currentUserId,
                        rating,
                        setRating,
                        comment,
                        setComment,
                        loading,
                        error,
                        success,
                        handleSubmit,
                        handleDelete,
                    }: any) {
    const [currentPage, setCurrentPage] = useState(1)
    const reviewsPerPage = 2

    const totalPages = Math.ceil(reviews.length / reviewsPerPage)
    const startIndex = (currentPage - 1) * reviewsPerPage
    const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage)

    return (
        <div className="p-4 space-y-4">
            {reviews.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-center">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">
                                {avgRating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        className={`w-4 h-4 ${
                                            star <= avgRating ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                {reviews.length} reviews
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review form */}
            {!userReview && currentUserId && (
                <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Write a review</h3>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`w-6 h-6 ${
                                            star <= rating
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                        } hover:text-yellow-400 transition-colors`}
                                    >
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        />
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        {success && <p className="text-green-600 text-sm">{success}</p>}
                        <button
                            type="submit"
                            disabled={loading || rating === 0}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Posting..." : "Post Review"}
                        </button>
                    </form>
                </div>
            )}

            {/* Reviews list */}
            <div className="space-y-3">
                {reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No reviews yet</p>
                        <p className="text-sm text-gray-400">
                            Be the first to share your experience!
                        </p>
                    </div>
                ) : (
                    currentReviews.map((review: any) => (
                        <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {(review.userName || "A").charAt(0).toUpperCase()}
                    </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {review.userName || "Anonymous"}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className={`w-4 h-4 ${
                                                        star <= review.rating
                                                            ? "text-yellow-400"
                                                            : "text-gray-300"
                                                    }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                            </div>

                            {review.comment && (
                                <p className="text-gray-700 mb-3">{review.comment}</p>
                            )}

                            <div className="flex gap-3 text-xs">
                                {review.userId === currentUserId && (
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Delete
                                    </button>
                                )}
                                {review.userId !== currentUserId && (
                                    <button
                                        onClick={async () => {
                                            const reason = prompt("Why are you reporting this review?")
                                            if (!reason) return
                                            try {
                                                const res = await fetch("/api/reviews/report", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ reviewId: review.id, reason }),
                                                })
                                                if (!res.ok) throw new Error("Failed to report review")
                                                alert("Review reported successfully!")
                                            } catch (err: any) {
                                                alert(err.message)
                                            }
                                        }}
                                        className="text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        Report
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination controls */}
            {reviews.length > reviewsPerPage && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}


function HistoryTab({ logs, currentPage, totalPages, setCurrentPage }: any) {
  return (
      <div className="p-4">
        {logs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📝</div>
              <p className="text-gray-500">No changes recorded</p>
              <p className="text-sm text-gray-400">This location hasn't been updated yet</p>
            </div>
        ) : (
            <>
              <div className="space-y-3">
                {logs.map((log: any) => (
                    <div key={log.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                  <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          log.action === "CREATE"
                              ? "bg-green-100 text-green-800"
                              : log.action === "UPDATE"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {log.action}
                  </span>
                        <span className="text-xs text-gray-400">ID: {log.id}</span>
                        <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">by {log.userId || "System"}</div>

                      <div className="space-y-2">
                        {log.action === "CREATE"
                            ? Object.entries(log.changes).map(([field, value]) => (
                                <div key={field} className="text-sm">
                                  <span className="font-medium text-gray-700">{field}:</span>{" "}
                                  <span className="text-gray-900">{String(value)}</span>
                                </div>
                            ))
                            : Object.entries(log.changes)
                                .filter(([_, change]: any) => change.old !== change.new)
                                .map(([field, change]: any) => (
                                    <div key={field} className="text-sm">
                                      <span className="font-medium text-gray-700">{field}:</span>{" "}
                                      <span className="text-red-600 line-through">{String(change.old)}</span>
                                      {" → "}
                                      <span className="text-green-600 font-medium">{String(change.new)}</span>
                                    </div>
                                ))}
                      </div>
                    </div>
                ))}
              </div>

              {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

                    <button
                        onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
              )}
            </>
        )}
      </div>
  )
}

interface EditBubblerFormProps {
  selectedWaypoint: Waypoint
  setSelectedWaypoint: Dispatch<SetStateAction<Waypoint | null>>
  hideForm: () => void
}

function EditBubblerForm({ selectedWaypoint, setSelectedWaypoint, hideForm }: EditBubblerFormProps) {
  const [formState, setFormState] = useState({
    name: selectedWaypoint.name || "",
    description: selectedWaypoint.description || "",
    verified: selectedWaypoint.verified || false,
    isaccessible: selectedWaypoint.isaccessible || false,
    dogfriendly: selectedWaypoint.dogfriendly || false,
    hasbottlefiller: selectedWaypoint.hasbottlefiller || false,
    imageUrl: selectedWaypoint.imageUrl || "",
    maintainer: selectedWaypoint.maintainer || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/waypoints?id=${selectedWaypoint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      })

      if (!res.ok) throw new Error("Failed to update bubbler")

      const updated = await res.json()
      setSelectedWaypoint(updated)
      hideForm()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="border-t border-gray-100 bg-gray-50 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
                value={formState.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
                value={formState.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintainer</label>
            <input
                value={formState.maintainer}
                onChange={(e) => handleChange("maintainer", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Who maintains this location?"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Features</label>
            <div className="space-y-2">
              {[
                { key: "isaccessible", label: "Is Accessible?" },
                { key: "dogfriendly", label: "Dog Friendly" },
                { key: "hasbottlefiller", label: "Has Bottle Filler" },
              ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={formState[key as keyof typeof formState] as boolean}
                        onChange={(e) => handleChange(key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
                value={formState.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="https://..."
            />
          </div>

          {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
          )}

          <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
  )
}

interface Message {
  role: "user" | "assistant"
  content: string
}

function AiTab({ selectedWaypoint }: { selectedWaypoint: Waypoint }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)
    scrollToBottom()

    try {
      const res = await fetch("https://ai.lkang.au/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `The user is currently viewing bubblerId: ${selectedWaypoint.id} (call it by the name, not id in chat). Do not do anything with this id until the user prompts you to. Please listen to the users instructions before doing anything. The users input is: ${input}. Please give a summary of anything the user asks.`,
          conversation: updatedMessages,
        }),
      })

      const data = await res.json()
      const aiReply: Message = { role: "assistant", content: data.reply || "No response" }
      setMessages([...updatedMessages, aiReply])
      scrollToBottom()
    } catch (err) {
      const errMessage: Message = { role: "assistant", content: "Error fetching AI response" }
      setMessages([...updatedMessages, errMessage])
      scrollToBottom()
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage()
  }

  return (
      <div className="p-4 space-y-4">
        <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg">
          {messages.map((msg, i) => (
              <div
                  key={i}
                  className={`p-2 rounded-lg text-sm ${
                      msg.role === "user"
                          ? "bg-blue-600 text-white ml-auto w-fit"
                          : "bg-gray-200 text-gray-800 mr-auto w-fit"
                  }`}
              >
                {msg.content}
              </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Ask Bubbly..."}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
  )
}
