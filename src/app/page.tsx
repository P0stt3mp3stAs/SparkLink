// src/app/page.tsx
'use client';

import { useAuth } from 'react-oidc-context';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CardStack from '@/components/CardStack';
import SparkelIntro from '@/components/SparkelIntro';
import InteractiveStack from '@/components/InteractiveStack';

export default function HomePage() {
  const auth = useAuth();
  const router = useRouter();

  // ---------- ALL HOOKS MUST BE BEFORE ANY RETURN ----------
  const [page, setPage] = useState(0);
  const totalPages = 4;
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);

  // Redirect if logged in
  useEffect(() => {
    if (auth.isAuthenticated) {
      router.replace('/profile');
    }
  }, [auth.isAuthenticated, router]);

  // Wheel scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling.current) return;

      isScrolling.current = true;

      if (e.deltaY > 0) {
        setPage((p) => Math.min(p + 1, totalPages - 1));
      } else {
        setPage((p) => Math.max(p - 1, 0));
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 800);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Mobile swipe
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isScrolling.current) return;

      const diff = touchStartY.current - e.touches[0].clientY;
      if (Math.abs(diff) < 50) return;

      isScrolling.current = true;

      if (diff > 0) {
        setPage((p) => Math.min(p + 1, totalPages - 1));
      } else {
        setPage((p) => Math.max(p - 1, 0));
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 800);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // Scroll to correct page
  useEffect(() => {
    window.scrollTo({
      top: page * window.innerHeight,
      behavior: 'smooth',
    });
  }, [page]);

  // --------- NOW we can return (RETURN MUST BE LAST) ---------
  if (auth.isLoading || auth.isAuthenticated) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-lg font-medium text-gray-600">Just a moment...</p>
      </main>
    );
  }

  const handleAuth = () => {
    auth.signinRedirect();
  };

  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory">

      {/* Section 1 */}
      <section className="h-screen snap-start flex flex-col items-center relative">

        {/* Top Bar */}
        <div className="w-11/12 mt-1 rounded-full flex items-center justify-between bg-[#2A5073] py-2 px-4">

          {/* LEFT SIDE — Logo + Text */}
          <div className="flex items-center gap-2">
            <img
              src="/sprklelogo.svg"
              alt="spark logo"
              className="h-8 sm:h-10 md:h-12 w-auto"
            />
            <h1 className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl">
              SPARK-LINK
            </h1>
          </div>

          {/* RIGHT — Sign In */}
          <button
            onClick={handleAuth}
            className="px-4 sm:px-6 py-2 rounded-full border-2 border-[#FFF5E6]
                       text-white font-medium bg-yellow-500 text-xs sm:text-sm md:text-base"
          >
            Sign In
          </button>
        </div>

        <div className="bg-gradient-to-b from-[#FCE9CE] to-[#FFF5E6] w-11/12 h-4/5 rounded-3xl mt-4 p-6 flex flex-col items-center justify-around">

          {/* 🔥 3 RESPONSIVE TAGS */}
          <div className="flex gap-2 sm:gap-3 text-white justify-center overflow-x-auto w-full">
            {/* One App */}
            <span className="
              bg-[#FFD700] rounded-full
              flex-shrink-0 px-2 sm:px-3 md:px-4 lg:px-5
              py-1 sm:py-2
              text-[7px] sm:text-[8px] md:text-sm lg:text-base xl:text-lg
              font-semibold
              flex items-center
            ">
              One App
            </span>

            {/* Two Worlds — FIXED SVG bg */}
            <span className="
              rounded-full flex-shrink-0 flex items-center justify-center 
              px-2 sm:px-3 md:px-4 lg:px-5
              py-1 sm:py-2
              text-[7px] sm:text-[8px] md:text-sm lg:text-base xl:text-lg
              font-semibold
              bg-[url('/linktxt.svg')] bg-contain bg-no-repeat bg-center
              min-h-[2rem] sm:min-h-[2.25rem]
            ">
              Three Worlds
            </span>

            {/* Endless Possibilities */}
            <span className="
              bg-[#2A5073] rounded-full 
              flex-shrink-0 px-2 sm:px-3 md:px-4 lg:px-5
              py-1 sm:py-2
              text-[7px] sm:text-[8px] md:text-sm lg:text-base xl:text-lg
              font-semibold
              flex items-center
            ">
              Endless Possibilities.
            </span>
          </div>

          {/* Logo */}
          <img 
            src="/logo1.svg" 
            alt="Logo" 
            className="mt-6 h-50 sm:h-60 md:h-70"
          />

          {/* Join Now Button */}
          <button 
            onClick={handleAuth} 
            className="mt-6 bg-[#FFD700] rounded-full px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold hover:brightness-110 transition"
          >
            Join Now
          </button>

        </div>

      </section>

      {/* Section 2 */}
      <section className="h-screen snap-start flex items-center justify-center">
        <CardStack />
      </section>

      {/* Section 3 */}
      <section className="h-screen snap-start flex items-center justify-center">
        <SparkelIntro />
      </section>

      {/* Section 4 */}
      <section className="h-screen snap-start flex items-center justify-center">
        <InteractiveStack />
      </section>
    </main>
  );
}