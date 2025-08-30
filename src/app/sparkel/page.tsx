// src/app/sparkel/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Sparkel() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user" as const, content: input };
    setChat((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/spark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      if (data.reply) {
        setChat((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ There was an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col h-screen bg-[#121212] text-white font-sans">
      {/* Header */}
      <header className="flex-none text-center text-3xl sm:text-4xl md:text-5xl text-yellow-400 py-4 border-b border-gray-800">
        Sparkel ✨
      </header>

      {/* Chat messages - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#1E1E1E] relative">
        {chat.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-center text-xl sm:text-2xl md:text-3xl font-semibold drop-shadow-md">
              Start a conversation with Sparkel!
            </p>
          </div>
        ) : (
          chat.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] break-words p-3 rounded-4xl text-sm sm:text-base ${
                  msg.role === "user" ? "bg-yellow-400 text-black" : "bg-white text-black"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area - fixed at bottom */}
      <div className="flex-none p-4 flex gap-2 border-t border-gray-800 bg-[#121212]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Sparkel..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-3 rounded-full border border-gray-700 bg-[#1E1E1E] text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="flex items-center justify-center flex-none p-3 bg-yellow-400 text-black font-bold rounded-full disabled:opacity-50"
        >
          {loading ? (
            "Thinking..."
          ) : (
            <Image src="/send.svg" alt="Send" width={24} height={24} />
          )}
        </button>
      </div>
    </div>
  );
}
