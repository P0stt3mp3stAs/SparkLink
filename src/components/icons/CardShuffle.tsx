'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CardShuffleProps {
  size?: number; // size in pixels
}

export function CardShuffle({ size = 24 }: CardShuffleProps) {
  const [isVisible, setIsVisible] = useState(true);
  const frontControls = useAnimation();
  const backControls = useAnimation();

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY < 50);
    window.addEventListener('scroll', handleScroll);

    const animateCards = async () => {
      while (isVisible) {
        // Animation logic remains the same
      }
    };

    animateCards();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible, frontControls, backControls]);

  if (!isVisible) return null;

  const cardWidth = size * 0.7; // Relative to the size prop
  const cardHeight = size; // Relative to the size prop

  return (
    <div className="flex flex-col items-center cursor-pointer">
      <div className="relative" style={{ width: cardWidth, height: cardHeight }}>
        {/* Back Card */}
        <motion.div
          className="absolute border-[3px] border-white rounded-xl"
          animate={backControls}
          style={{
            width: cardWidth,
            height: cardHeight,
            boxShadow: '0 0 1px rgba(255, 255, 255, 0), 0 0 30px rgba(255, 255, 255, 0.2)',
            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.1))'
          }}
        />
        
        {/* Front Card */}
        <motion.div
          className="absolute border-[3px] border-yellow-500 rounded-xl"
          animate={frontControls}
          style={{
            width: cardWidth,
            height: cardHeight,
            boxShadow: '0 0 1px rgba(255, 255, 255, 0.8), 0 0 30px rgba(242, 255, 100, 0.2)',
            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.1))'
          }}
        />
      </div>
    </div>
  );
}