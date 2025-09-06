"use client";

import React, { useState, useEffect } from "react";
import type { Waypoint } from "@/types";
import type { Dispatch, SetStateAction } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
  userName?: string;
}

interface WaypointInfoPanelProps {
  selectedWaypoint: Waypoint;
  setSelectedWaypoint: Dispatch<SetStateAction<Waypoint | null>>;
  hideRedMarker: () => void;
  currentUserId?: string;
}

export default function WaypointInfoPanel({
  selectedWaypoint,
  setSelectedWaypoint,
  hideRedMarker,
  currentUserId,
}: WaypointInfoPanelProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  // --- Reviews State ---
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!selectedWaypoint?.id) return;

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?bubblerId=${selectedWaypoint.id}`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data: Review[] = await res.json();
        const normalized: Review[] = data.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          userId: r.userId,
          userName: r.user?.username || "Anonymous",
        }));
        setReviews(normalized);

        if (data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setAvgRating(avg);
        } else {
          setAvgRating(0);
        }

        const myReview = data.find((r) => r.userId === currentUserId) || null;
        setUserReview(myReview);
      } catch (err: any) {
        console.error(err);
      }
    }

    fetchReviews();
  }, [selectedWaypoint?.id, currentUserId]);

  // --- Review Handlers ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (userReview) {
      setError("You can only post one review per bubbler.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bubblerId: selectedWaypoint.id,
          rating,
          comment,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      const newReview: Review = await res.json();
      setReviews((prev) => [...prev, newReview]);
      setUserReview(newReview);

      setSuccess("Review submitted!");
      setRating(0);
      setComment("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(reviewId: string) {
    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete review");

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if (userReview?.id === reviewId) setUserReview(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed top-20 left-5 z-10 w-96 bg-white shadow-xl border border-gray-200 flex flex-col max-h-[80vh] overflow-y-auto">
      {selectedWaypoint.imageUrl && (
        <div className="w-full h-48 overflow-hidden rounded-t-md bg-gray-100">
          <img
            src={selectedWaypoint.imageUrl}
            alt={selectedWaypoint.name || "Bubbler image"}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}


      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="font-bold text-blue-600 text-lg truncate">
          {selectedWaypoint.name || "Unknown"}
        </h3>
        <button
          onClick={() => setShowEditForm((prev) => !prev)}
          className="text-sm text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
        >
          {showEditForm ? "Close Edit" : "Edit Bubbler"}
        </button>
      </div>

      {showEditForm && (
        <EditBubblerForm
          selectedWaypoint={selectedWaypoint}
          setSelectedWaypoint={setSelectedWaypoint}
          hideForm={() => setShowEditForm(false)}
        />
      )}

      {/* --- Existing Waypoint Info & Reviews --- */}
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
        <p>
          <strong>Verified:</strong>{" "}
          {selectedWaypoint.verified ? "Yes" : "No"}
        </p>
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

        <div className="mt-4">
          <h4 className="font-semibold text-lg">Reviews</h4>
          <p className="text-sm text-gray-600">
            Average rating:{" "}
            <span className="font-bold">{avgRating.toFixed(1)}</span>/5 (
            {reviews.length} reviews)
          </p>
        </div>

        <button
          onClick={async () => {
            const reason = prompt("Why are you reporting this bubbler?");
            if (!reason) return;

            try {
              const res = await fetch("/api/waypoints/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waypointId: selectedWaypoint.id, reason }),
              });
              if (!res.ok) throw new Error("Failed to report bubbler");
              alert("Bubbler reported successfully!");
            } catch (err: any) {
              alert(err.message);
            }
          }}
          className="bg-orange-600 text-white py-1 px-3 rounded hover:bg-orange-700 text-sm"
        >
          Report Bubbler
        </button>

        {/* Reviews & Review Form */}
        <div className="space-y-3 mt-3">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>


          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="border rounded-md p-2 text-sm bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{r.rating}★</p>
                  <span className="text-xs text-gray-500">
                    {r.userName || "Anonymous"}
                  </span>
                </div>
                {r.comment && <p>{r.comment}</p>}
                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                </p>

                <div className="flex gap-2 mt-1">
                  {r.userId === currentUserId && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Delete
                    </button>
                  )}
                  {r.userId !== currentUserId && (
                    <button
                      onClick={async () => {
                        const reason = prompt("Why are you reporting this review?");
                        if (!reason) return;
                        try {
                          const res = await fetch("/api/reviews/report", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ reviewId: r.id, reason }),
                          });
                          if (!res.ok) throw new Error("Failed to report review");
                          alert("Review reported successfully!");
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }}
                      className="text-orange-600 text-xs hover:underline"
                    >
                      Report Abuse
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

// ---------------- Edit Form Component ----------------
interface EditBubblerFormProps {
  selectedWaypoint: Waypoint;
  setSelectedWaypoint: Dispatch<SetStateAction<Waypoint | null>>;
  hideForm: () => void;
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/waypoints?id=${selectedWaypoint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) throw new Error("Failed to update bubbler");

      const updated = await res.json();
      setSelectedWaypoint(updated);
      hideForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            value={formState.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formState.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div className="flex flex-col space-y-2">
          {["verified", "isaccessible", "dogfriendly", "hasbottlefiller"].map((key) => (
            <label key={key} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formState[key as keyof typeof formState] as boolean}
                onChange={(e) => handleChange(key, e.target.checked)}
              />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            value={formState.imageUrl}
            onChange={(e) => handleChange("imageUrl", e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Bubbler"}
        </button>
      </form>
    </div>
  );
}
