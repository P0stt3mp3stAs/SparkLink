// ✅ FILE 5: src/components/icons/Scroll.tsx
'use client';

import { motion } from 'framer-motion';

export default function ScrollIcon() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 24 36"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Mouse outline */}
        <rect
          x="1"
          y="1"
          width="22"
          height="34"
          rx="11"
          stroke="white"
          strokeWidth="2"
        />

        {/* Animated wheel */}
        <motion.rect
          x="10.5"
          y="6"
          width="3"
          height="6"
          rx="1.5"
          fill="#FFD700"
          animate={{
            y: [6, 18, 6],
            opacity: [1, 0.3, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          transform="translate(-1 0)"
        />
      </svg>
    </div>
  );
}
