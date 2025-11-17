// ✅ FILE 3: src/components/icons/MessageIcon.tsx
'use client';

import { motion } from 'framer-motion';

export default function AnimatedMessagesIcon() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
        {/* Main Bubble */}
        <path
          d="M12 8 h40 a8 8 0 0 1 8 8 v26 a8 8 0 0 1 -8 8 H28 l-10 8 -1.5 -8 H12 a8 8 0 0 1 -8 -8 V16 a8 8 0 0 1 8 -8 Z"
          fill="none"
          stroke="black"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Line 1 */}
        <motion.rect
          x="20"
          y="20"
          height="4"
          rx="2"
          fill="black"
          animate={{ width: [28, 5, 28] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Line 2 */}
        <motion.rect
          x="20"
          y="30"
          height="4"
          rx="2"
          fill="black"
          animate={{ width: [18, 3, 18] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />
      </svg>
    </div>
  );
}
