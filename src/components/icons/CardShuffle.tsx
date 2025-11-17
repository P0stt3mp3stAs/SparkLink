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
      // wait until motion.divs are mounted
      await new Promise((r) => setTimeout(r, 0));

      while (mounted) {
        // Forward motion
        await frontControls.start({
          x: -8,
          y: -5,
          rotateZ: -6,
          rotateY: 15,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });
        await backControls.start({
          x: 8,
          y: 5,
          rotateZ: 6,
          rotateY: -15,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });

        // Backward motion
        await frontControls.start({
          x: 8,
          y: 5,
          rotateZ: 6,
          rotateY: -15,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });
        await backControls.start({
          x: -8,
          y: -5,
          rotateZ: -6,
          rotateY: 15,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });

        // Return to center
        await frontControls.start({
          x: 0,
          y: 0,
          rotateZ: 0,
          rotateY: 0,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });
        await backControls.start({
          x: 0,
          y: 0,
          rotateZ: 0,
          rotateY: 0,
          transition: { duration: 0.3, ease: 'easeInOut' },
        });

        await new Promise((r) => setTimeout(r, 500));
      }
    };

    // 🔹 Start animation after one frame (component mounted)
    const frame = requestAnimationFrame(() => animateCards());

    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
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
          style={{
            boxShadow:
              '0 0 1px rgba(255, 255, 255, 0), 0 0 30px rgba(255, 255, 255, 0.2)',
            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.1))',
          }}
        />
        <motion.div
          className="absolute h-8 w-6 border-[3px] border-yellow-500 rounded-lg"
          animate={frontControls}
          style={{
            boxShadow:
              '0 0 1px rgba(255, 255, 255, 0.8), 0 0 30px rgba(242, 255, 100, 0.2)',
            filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.1))',
          }}
        />
      </div>
    </div>
  );
}
