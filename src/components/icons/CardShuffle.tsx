'use client';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CardShuffle() {
  const [isVisible, setIsVisible] = useState(true);
  const frontControls = useAnimation();
  const backControls = useAnimation();

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY < 50);
    window.addEventListener('scroll', handleScroll);

    let mounted = true; // ensures we only animate when mounted

    const animateCards = async () => {
      while (mounted) {
        // Forward motion
        await frontControls.start({
          x: -8,
          y: -5,
          rotateZ: -6,
          rotateY: 15,
          transition: { duration: 0.3, ease: "easeInOut" }
        });
        await backControls.start({
          x: 8,
          y: 5,
          rotateZ: 6,
          rotateY: -15,
          transition: { duration: 0.3, ease: "easeInOut" }
        });

        // Backward motion
        await frontControls.start({
          x: 8,
          y: 5,
          rotateZ: 6,
          rotateY: -15,
          transition: { duration: 0.3, ease: "easeInOut" }
        });
        await backControls.start({
          x: -8,
          y: -5,
          rotateZ: -6,
          rotateY: 15,
          transition: { duration: 0.3, ease: "easeInOut" }
        });

        // Return to center
        await frontControls.start({
          x: 0,
          y: 0,
          rotateZ: 0,
          rotateY: 0,
          transition: { duration: 0.3, ease: "easeInOut" }
        });
        await backControls.start({
          x: 0,
          y: 0,
          rotateZ: 0,
          rotateY: 0,
          transition: { duration: 0.3, ease: "easeInOut" }
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };

    animateCards(); // start animation after mount

    return () => {
      mounted = false; // stop animation on unmount
      window.removeEventListener('scroll', handleScroll);
    };
  }, [frontControls, backControls]);

  if (!isVisible) return null;

  return (
    <div className="fixed -translate-x-1/2 z-50 flex flex-col items-center cursor-pointer">
      <div className="flex flex-col items-center">
        <motion.div
          className="absolute h-8 w-6 border-[3px] border-white rounded-lg"
          animate={backControls}
          style={{
            boxShadow: '0 0 1px rgba(255, 255, 255, 0), 0 0 30px rgba(255, 255, 255, 0.2)',
            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.1))'
          }}
        />
        <motion.div
          className="absolute h-8 w-6 border-[3px] border-yellow-500 rounded-lg"
          animate={frontControls}
          style={{
            boxShadow: '0 0 1px rgba(255, 255, 255, 0.8), 0 0 30px rgba(242, 255, 100, 0.2)',
            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.1))'
          }}
        />
      </div>
    </div>
  );
}
