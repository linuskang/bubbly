"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import type { Waypoint } from "@/types";

interface AddWaypointModalProps {
    selectedWaypoint: Waypoint;
    setSelectedWaypoint: React.Dispatch<React.SetStateAction<Waypoint | null>>;
    setShowAddForm: (show: boolean) => void;
    submitBubbler: () => Promise<void>; // add this
}

export default function AddWaypointModal({
                                           selectedWaypoint,
                                           setSelectedWaypoint,
                                           setShowAddForm,
    submitBubbler,
                                         }: AddWaypointModalProps) {
  const { data: session } = useSession();
  console.log(session);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!selectedWaypoint.name || !selectedWaypoint.latitude || !selectedWaypoint.longitude) {
      setMessage("Name, latitude, and longitude are required.");
      return;
    }

    if (!session?.user?.id) {
      setMessage("You must be logged in to add a waypoint.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name: selectedWaypoint.name,
        latitude: selectedWaypoint.latitude,
        longitude: selectedWaypoint.longitude,
        description: selectedWaypoint.description || "",
        addedby: session.user.name || "Unknown",
        addedbyuserid: session.user.id,
        verified: false,
        isaccessible: selectedWaypoint.isaccessible || false,
        dogfriendly: selectedWaypoint.dogfriendly || false,
        hasbottlefiller: selectedWaypoint.hasbottlefiller || false,
        type: "fountain", // fixed type
        maintainer: selectedWaypoint.maintainer || "",
        imageUrl: selectedWaypoint.imageUrl || "",
      };

      const res = await fetch("/api/waypoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
          credentials: "include"
      });

      if (res.ok) {
        setMessage("Waypoint added successfully!");
        setSelectedWaypoint(null);
        setShowAddForm(false);
      } else {
        const text = await res.text();
        setMessage(`Error: ${text}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit waypoint.");
    } finally {
      setLoading(false);
    }
  };

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
              onChange={(e) =>
                  setSelectedWaypoint((prev) => (prev ? { ...prev, name: e.target.value } : prev))
              }
          />

          {/* Description */}
          <textarea
              placeholder="Description"
              className="w-full border rounded px-3 py-2"
              value={selectedWaypoint.description || ""}
              onChange={(e) =>
                  setSelectedWaypoint((prev) =>
                      prev ? { ...prev, description: e.target.value } : prev
                  )
              }
          />

          {/* Latitude */}
          <input
              type="number"
              placeholder="Latitude"
              className="w-full border rounded px-3 py-2"
              value={selectedWaypoint.latitude || ""}
              onChange={(e) =>
                  setSelectedWaypoint((prev) =>
                      prev ? { ...prev, latitude: parseFloat(e.target.value) } : prev
                  )
              }
          />

          {/* Longitude */}
          <input
              type="number"
              placeholder="Longitude"
              className="w-full border rounded px-3 py-2"
              value={selectedWaypoint.longitude || ""}
              onChange={(e) =>
                  setSelectedWaypoint((prev) =>
                      prev ? { ...prev, longitude: parseFloat(e.target.value) } : prev
                  )
              }
          />

          {/* Maintainer */}
          <input
              type="text"
              placeholder="Maintainer"
              className="w-full border rounded px-3 py-2"
              value={selectedWaypoint.maintainer || ""}
              onChange={(e) =>
                  setSelectedWaypoint((prev) =>
                      prev ? { ...prev, maintainer: e.target.value } : prev
                  )
              }
          />

          {/* Image URL */}
          <input
              type="text"
              placeholder="Image URL"
              className="w-full border rounded px-3 py-2"
              value={selectedWaypoint.imageUrl || ""}
              onChange={(e) =>
                  setSelectedWaypoint((prev) =>
                      prev ? { ...prev, imageUrl: e.target.value } : prev
                  )
              }
          />

          {/* Accessible */}
          <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={selectedWaypoint.isaccessible || false}
                onChange={(e) =>
                    setSelectedWaypoint((prev) =>
                        prev ? { ...prev, isaccessible: e.target.checked } : prev
                    )
                }
            />
            Accessible
          </label>

          {/* Dog Friendly */}
          <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={selectedWaypoint.dogfriendly || false}
                onChange={(e) =>
                    setSelectedWaypoint((prev) =>
                        prev ? { ...prev, dogfriendly: e.target.checked } : prev
                    )
                }
            />
            Dog Friendly
          </label>

          {/* Bottle Filler */}
          <label className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={selectedWaypoint.hasbottlefiller || false}
                onChange={(e) =>
                    setSelectedWaypoint((prev) =>
                        prev ? { ...prev, hasbottlefiller: e.target.checked } : prev
                    )
                }
            />
            Bottle Filler
          </label>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded border">
              Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={!selectedWaypoint.name || loading}
                className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
  );
}
