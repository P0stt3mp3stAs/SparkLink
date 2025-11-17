"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function Sparkel() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
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
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
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
    <div className="flex flex-col min-h-[calc(100vh-4.77rem)]">
      {/* Header */}
      <header
        className="
          w-full text-center
          text-[#2A5073]
          py-4 font-semibold
          text-xl sm:text-2xl md:text-3xl
          bg-[#FFF5E6]
        "
      >
        Sparkel ✨
      </header>

      {/* Chat container with proper spacing for navbar */}
      <div
        className="
          flex-1 flex flex-col
          px-4
          overflow-hidden
        "
      >
        {/* SCROLLABLE MESSAGES BOX */}
        <div
          ref={messagesContainerRef}
          className="
            flex-1 overflow-y-auto w-full
            bg-gradient-to-b from-[#FCE9CE] to-[#FFF5E6]
            rounded-xl
            p-3 space-y-2
            mb-4
            flex flex-col 
          "
        >
          {/* Chat Messages */}
          {chat.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p
                className="
                  text-[#2A5073] text-center font-semibold
                  text-lg sm:text-xl md:text-2xl
                "
              >
                Start a conversation with Sparkel!
              </p>
            </div>
          ) : (
            chat.map((msg, i) => (
              <div
                key={i}
                className={`flex mb-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] break-words p-3 sm:p-4 rounded-3xl shadow-md
                    ${
                      msg.role === "user"
                        ? "bg-[#FFD700] text-black"
                        : "bg-white text-[#2A5073]"
                    }
                  `}
                  style={{
                    fontSize: "clamp(0.9rem, 1vw + 0.5rem, 1.2rem)",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area - Fixed at bottom but within the container */}
        <div
          className="
            flex items-center gap-3 sm:gap-4
            bg-[#FCE9CE]
            p-1 sm:p-2 rounded-full
            border border-[#2A5073]/20
            shadow-md
            mb-2
          "
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sparkel..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="
              flex-1 p-3 sm:p-4 rounded-full
              bg-white border border-[#FFD700]/40
              focus:outline-none focus:ring-2 focus:ring-[#FFD700]
              text-black text-sm sm:text-base
              transition-all
              font-sans
              text-[clamp(0.9rem, 4vw, 1.2rem)] sm:text-[clamp(1rem, 2vw, 1.4rem)]
            "
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="
              w-8 h-8 sm:w-10 sm:h-10 mr-1
              flex items-center justify-center
              p-1 sm:p-2
              bg-[#FFD700] text-white font-bold
              rounded-full transition hover:bg-[#FFD700]
              text-[clamp(0.9rem, 4vw, 1.2rem)] sm:text-[clamp(1rem, 2vw, 1.4rem)]
            "
          >
            {loading ? (
              "◯"
            ) : (
              <Image src="/send.svg" alt="Send" width={24} height={24} className="px-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}