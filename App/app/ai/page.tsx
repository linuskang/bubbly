"use client"

import { useState } from "react"

export default function OllamaChat() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      setResponse(data.response || JSON.stringify(data))
    } catch (err) {
      setResponse("Error: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center p-6 gap-4">
      <textarea
        className="w-full max-w-lg p-2 border rounded-md"
        rows={4}
        placeholder="Type your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleSend}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Send"}
      </button>
      {response && (
        <div className="w-full max-w-lg p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
          <strong>Ollama:</strong> {response}
        </div>
      )}
    </div>
  )
}
