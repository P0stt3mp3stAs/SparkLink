'use client';

import { motion } from 'framer-motion';

interface ProfileIconProps {
  size?: number; // size in pixels
}

export default function ProfileIcon({ size = 24 }: ProfileIconProps) {
  const strokeWidth = size / 16; // Dynamic stroke width based on size
  const headRadius = size / 4; // Dynamic head size

  return (
    <div className="flex items-center justify-center">
      <svg 
        viewBox="0 0 64 64" 
        width={size} 
        height={size}
        className="flex-shrink-0"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <motion.circle
          cx="32"
          cy="20"
          r={headRadius}
          fill="currentColor"
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
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}