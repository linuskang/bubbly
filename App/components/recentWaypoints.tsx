"use client"

import type React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import type { Waypoint } from "@/types"

interface FountainsPanelProps {
    recentWaypoints: Waypoint[]
    map: React.RefObject<any>
    selectWaypoint: (waypoint: Waypoint) => void
    isMinimized: boolean
    setIsMinimized: (minimized: boolean) => void
}

export default function FountainsPanel({
                                           recentWaypoints = [],
                                           map,
                                           selectWaypoint,
                                           isMinimized,
                                           setIsMinimized,
                                       }: FountainsPanelProps) {
    return (
        <div className="absolute top-20 right-4 z-10 w-72 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Recently Added Fountains</h3>
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
                    {recentWaypoints.length === 0 ? (
                        <p className="text-sm text-gray-500">No recent waypoints</p>
                    ) : (
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                            {recentWaypoints.map((w) => (
                                <li
                                    key={w.id}
                                    className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={() => {
                                        if (map.current?.flyTo) {
                                            map.current.flyTo({ center: [w.longitude, w.latitude], zoom: 16 })
                                        }
                                        selectWaypoint(w)
                                    }}
                                >
                                    <p className="text-sm font-medium text-gray-800">{w.name}</p>
                                    <p className="text-xs text-gray-500">
                                        Added by {w.addedby || "Unknown"} on{" "}
                                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "Unknown date"}
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
