"use client";

import { useState } from "react";

interface ReportUserButtonProps {
  username: string; //username of reported user as string.
}

export default function ReportUserButton({ username }: ReportUserButtonProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReport = async () => {
    if (!reason.trim()) {
      setMessage("Please enter a reason.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/user/${username}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        setMessage("Report submitted successfully.");
        setReason("");
      } else {
        const text = await res.text();
        setMessage(`Error: ${text}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter reason for reporting this user"
        className="w-full border rounded p-2 text-sm"
        rows={3}
      />
      <button
        onClick={handleReport}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Reporting..." : "Report Abuse"}
      </button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
