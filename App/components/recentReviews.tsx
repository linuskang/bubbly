"use client"

import React, { useState } from "react"
import { ChevronUp, ChevronDown, Star } from "lucide-react"
import type {Waypoint} from "@/types";

interface Review {
    id: number
    waypointName: string
    rating: number
    comment: string
    waypoint: Waypoint
    reviewedBy: string
    createdAt: string
}

export type ReviewsPanelProps = {
    recentReviews?: Review[]
    map: React.RefObject<any>
    selectWaypoint: (w: Waypoint) => void
    waypoints: Waypoint[]
    fountainsPanelMinimized?: boolean
}

export default function ReviewsPanel({
                                         recentReviews = [],
                                         map,
                                         selectWaypoint,
                                         fountainsPanelMinimized = false,
    waypoints
                                     }: ReviewsPanelProps) {
    const [isMinimized, setIsMinimized] = useState(false)

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))
    }

    return (
        <div
            className={`absolute right-4 z-50 w-72 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                fountainsPanelMinimized ? "top-37" : "top-96"
            }`}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Recent Reviews</h3>
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label={isMinimized ? "Expand panel" : "Minimize panel"}
                >
                    {isMinimized ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                    )}
                </button>
            </div>

            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isMinimized ? "max-h-0" : "max-h-80"}`}
            >
                <div className="p-4">
                    {recentReviews.length === 0 ? (
                        <p className="text-sm text-gray-500">No recent reviews</p>
                    ) : (
                        <ul className="space-y-3 max-h-64 overflow-y-auto">
                            {recentReviews.map((review) => (
                                <li
                                    key={review.id}
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={() => {
                                        const w = waypoints.find(wp => wp.name === review.waypointName)
                                        if (!w || !map?.current?.flyTo) return
                                        map.current.flyTo({ center: [w.longitude, w.latitude], zoom: 16 })
                                        selectWaypoint(w)
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-800 truncate">{review.waypointName}</p>
                                        <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{review.comment}</p>
                                    <p className="text-xs text-gray-500">
                                        By {review.reviewedBy} on {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
