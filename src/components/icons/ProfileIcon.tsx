'use client';

import { motion } from 'framer-motion';

export default function ProfileIcon() {
  return (
    <div className="w-14 h-14 flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <motion.circle
          cx="32"
          cy="20"
          r="10"
          fill="#ffffff"
          animate={{
            cy: [20, 18, 22, 20],
            cx: [32, 30, 34, 32],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Shoulders / Torso */}
        <path
          d="M16 50c0-8.8 7.2-16 16-16s16 7.2 16 16"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
