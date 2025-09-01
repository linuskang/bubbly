"use client"

import React from "react"
import type { Waypoint } from "@/types"
import type { Dispatch, SetStateAction } from "react"

interface WaypointInfoPanelProps {
  selectedWaypoint: Waypoint
  setSelectedWaypoint: Dispatch<SetStateAction<Waypoint | null>>
  hideRedMarker: () => void
}

export default function WaypointInfoPanel({
  selectedWaypoint,
  setSelectedWaypoint,
  hideRedMarker,
}: WaypointInfoPanelProps) {
  return (
    <div className="fixed top-0 left-0 z-5 h-full w-107 bg-white shadow-xl border-r border-gray-200 flex flex-col">
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
      </div>
    </div>
  )
}
