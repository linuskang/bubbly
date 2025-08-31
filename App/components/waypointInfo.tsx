"use client"

import React from "react"
import type { Waypoint } from "@/types" // adjust the import path
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
    <div className="absolute top-20 left-5 z-20 w-80 bg-white shadow-lg rounded-lg p-4 max-h-[80vh] overflow-y-auto">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold"
        onClick={() => {
          setSelectedWaypoint(null)
          hideRedMarker()
        }}
      >
        ×
      </button>

      <h3 className="font-bold text-blue-600 text-lg">
        {selectedWaypoint.name || "Unknown"}
      </h3>

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
          <strong>Verified:</strong> {selectedWaypoint.verified ? "Yes" : "No"}
        </p>
      )}
      <p>
        <strong>Accessible:</strong> {selectedWaypoint.isaccessible ? "Yes" : "No"}
      </p>
      <p>
        <strong>Dog Friendly:</strong> {selectedWaypoint.dogfriendly ? "Yes" : "No"}
      </p>
      <p>
        <strong>Bottle Filler:</strong> {selectedWaypoint.hasbottlefiller ? "Yes" : "No"}
      </p>
      {selectedWaypoint.createdAt && (
        <p>
          <strong>Created at:</strong> {new Date(selectedWaypoint.createdAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}
