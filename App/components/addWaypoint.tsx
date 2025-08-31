"use client"

import React from "react"

interface Waypoint {
  id: number
  name?: string
  description?: string
  type?: string
  isaccessible?: boolean
  dogfriendly?: boolean
  hasbottlefiller?: boolean
}

interface AddWaypointModalProps {
  selectedWaypoint: Waypoint
  setSelectedWaypoint: React.Dispatch<React.SetStateAction<Waypoint | null>>
  setShowAddForm: (show: boolean) => void
  submitBubbler: () => void
}

export default function AddWaypointModal({
  selectedWaypoint,
  setSelectedWaypoint,
  setShowAddForm,
  submitBubbler,
}: AddWaypointModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold">Add Water Fountain</h2>

        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          className="w-full border rounded px-3 py-2"
          value={selectedWaypoint.name || ""}
          onChange={e =>
            setSelectedWaypoint(prev => prev ? { ...prev, name: e.target.value } : prev)
          }
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          className="w-full border rounded px-3 py-2"
          value={selectedWaypoint.description || ""}
          onChange={e =>
            setSelectedWaypoint(prev => prev ? { ...prev, description: e.target.value } : prev)
          }
        />

        {/* Type */}
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedWaypoint.type || "fountain"}
          onChange={e =>
            setSelectedWaypoint(prev => prev ? { ...prev, type: e.target.value } : prev)
          }
        >
          <option value="fountain">Fountain</option>
          <option value="bubbler">Bubbler</option>
          <option value="tap">Tap</option>
        </select>

        {/* Accessible */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedWaypoint.isaccessible || false}
            onChange={e =>
              setSelectedWaypoint(prev => prev ? { ...prev, isaccessible: e.target.checked } : prev)
            }
          />
          Accessible
        </label>

        {/* Dog Friendly */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedWaypoint.dogfriendly || false}
            onChange={e =>
              setSelectedWaypoint(prev => prev ? { ...prev, dogfriendly: e.target.checked } : prev)
            }
          />
          Dog Friendly
        </label>

        {/* Bottle Filler */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedWaypoint.hasbottlefiller || false}
            onChange={e =>
              setSelectedWaypoint(prev => prev ? { ...prev, hasbottlefiller: e.target.checked } : prev)
            }
          />
          Bottle Filler
        </label>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setShowAddForm(false)}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            onClick={submitBubbler}
            disabled={!selectedWaypoint.name}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
