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

    let mounted = true;

    const animateCards = async () => {
      // 🔹 Ensure animations are mounted
      await frontControls.stop();
      await backControls.stop();

      while (mounted) {
        await frontControls.start({
          x: -8, y: -5, rotateZ: -6, rotateY: 15,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });

        await backControls.start({
          x: 8, y: 5, rotateZ: 6, rotateY: -15,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });

        await frontControls.start({
          x: 8, y: 5, rotateZ: 6, rotateY: -15,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });

        await backControls.start({
          x: -8, y: -5, rotateZ: -6, rotateY: 15,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });

        await frontControls.start({
          x: 0, y: 0, rotateZ: 0, rotateY: 0,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });

        await backControls.start({
          x: 0, y: 0, rotateZ: 0, rotateY: 0,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });

        await new Promise(r => setTimeout(r, 500));
      }
    };

    // 🔹 Start after mount — this is safe
    animateCards();

    return () => {
      mounted = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [frontControls, backControls]);

  if (!isVisible) return null;

  return (
    <div className="fixed translate-x-4 z-50 flex flex-col items-center cursor-pointer">
      <div className="flex flex-col items-center relative">
        <motion.div
          className="absolute h-8 w-6 border-[3px] border-black rounded-lg"
          animate={backControls}
        />
        <motion.div
          className="absolute h-8 w-6 border-[3px] border-yellow-500 rounded-lg"
          animate={frontControls}
        />
      </div>
    </div>
  );
}
