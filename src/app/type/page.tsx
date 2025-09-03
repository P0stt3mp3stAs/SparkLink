'use client';
import { useState, useEffect } from 'react';

export default function TypewriterWithButton() {
  const paragraph =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

  const [displayedText, setDisplayedText] = useState('');
  const [typing, setTyping] = useState(false); // typing starts after button click
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!typing) return;

    const interval = setInterval(() => {
      setDisplayedText(paragraph.slice(0, index + 1));
      setIndex((prev) => prev + 1);
    }, 50);

    if (index >= paragraph.length) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [typing, index, paragraph]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black p-10">
      <p className="text-white text-lg md:text-xl font-mono whitespace-pre-wrap">
        {displayedText}
        {typing && <span className="inline-block animate-blink">|</span>}
      </p>

      {!typing && (
        <button
          onClick={() => setTyping(true)}
          className="mt-10 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Start Typing
        </button>
      )}

      <style jsx>{`
        .animate-blink {
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
