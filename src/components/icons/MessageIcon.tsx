'use client';

import { motion } from 'framer-motion';

interface MessageIconProps {
  size?: number; // size in pixels
}

export default function MessageIcon({ size = 24 }: MessageIconProps) {
  const strokeWidth = size / 16; // Dynamic stroke width based on size

  return (
    <div className="flex items-center justify-center">
      <svg 
        viewBox="0 0 64 64" 
        width={size} 
        height={size}
        className="flex-shrink-0"
      >
        {/* Main Bubble */}
        <path
          d="M12 8 h40 a8 8 0 0 1 8 8 v26 a8 8 0 0 1 -8 8 H28 l-10 8 -1.5 -8 H12 a8 8 0 0 1 -8 -8 V16 a8 8 0 0 1 8 -8 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Lines with dynamic sizing */}
        <motion.rect
          x="20"
          y="20"
          height={strokeWidth}
          rx={strokeWidth / 2}
          fill="currentColor"
          animate={{ width: [28, 5, 28] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />

        <motion.rect
          x="20"
          y="30"
          height={strokeWidth}
          rx={strokeWidth / 2}
          fill="currentColor"
          animate={{ width: [18, 3, 18] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
        />
      </svg>
    </div>
  );
}