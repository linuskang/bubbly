"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // <-- add this

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://ai.lkang.au/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          conversation: updatedMessages,
        }),
      });

      const data = await res.json();
      const aiReply: Message = { role: "assistant", content: data.reply || "No response" };
      setMessages([...updatedMessages, aiReply]);
    } catch (err) {
      const errMessage: Message = { role: "assistant", content: "Error fetching AI response" };
      setMessages([...updatedMessages, errMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Bubbly AI Chat</h1>
      <div className="flex-1 overflow-y-auto mb-4 p-2 bg-white rounded shadow flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-[70%] ${
              msg.role === "user" ? "bg-blue-200 self-end" : "bg-green-200 self-start"
            }`}
          >
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
            <div className="mt-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="italic text-gray-500">AI is typing...</div>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about bubblers..."
        />
        <button
          className="p-2 bg-blue-500 text-white rounded"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
