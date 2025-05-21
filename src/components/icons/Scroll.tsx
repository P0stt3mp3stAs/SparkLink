'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface ScrollProps {
  size?: number; // size in pixels
}

export default function Scroll({ size = 24 }: ScrollProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (inView) controls.start('visible');
    
    const handleScroll = () => setIsVisible(window.scrollY < 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [inView, controls]);

  if (!isVisible) return null;

  const mouseWidth = size;
  const mouseHeight = size * 1.4;
  const wheelWidth = size / 6;
  const wheelHeight = size / 4;

  return (
    <motion.div
      ref={ref}
      className="opacity-80 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
    >
      <div className="flex flex-col items-center">
        {/* Mouse outline */}
        <motion.div 
          className="relative border-2 border-white rounded-full mb-2 flex justify-center"
          style={{
            width: mouseWidth,
            height: mouseHeight,
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Animated wheel */}
          <motion.div
            className="absolute top-2 bg-yellow-500 rounded-full"
            style={{
              width: wheelWidth,
              height: wheelHeight,
            }}
            animate={{
              y: [0, mouseHeight * 0.6, 0],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};