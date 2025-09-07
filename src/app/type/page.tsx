'use client';

import { useState } from "react";

export default function ExplosionPage() {
  const [explode, setExplode] = useState(false);

  return (
    <div
      className={`relative h-screen w-full flex items-center justify-center transition-colors duration-700 ${
        explode ? "bg-red-700" : "bg-black"
      }`}
    >
      {/* Explosion effect */}
      {explode && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-yellow-400 animate-explosion" />
        </div>
      )}

      {/* Trigger button */}
      {!explode && (
        <button
          onClick={() => setExplode(true)}
          className="z-10 px-6 py-3 bg-white text-black font-bold rounded-lg shadow-lg hover:bg-gray-200 transition"
        >
          Trigger Explosion
        </button>
      )}

      {/* Explosion animation */}
      <style jsx>{`
        @keyframes explosion {
          0% {
            transform: scale(0.2);
            opacity: 1;
          }
          50% {
            transform: scale(3);
            opacity: 0.9;
            background: orange;
          }
          80% {
            transform: scale(5);
            opacity: 0.4;
            background: red;
          }
          100% {
            transform: scale(8);
            opacity: 0;
            background: darkred;
          }
        }
        .animate-explosion {
          animation: explosion 1s forwards;
        }
      `}</style>
    </div>
  );
}
