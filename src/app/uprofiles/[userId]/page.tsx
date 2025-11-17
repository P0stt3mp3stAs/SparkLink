'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { differenceInYears, format } from 'date-fns';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Profile {
  username: string;
  date_of_birth?: string;
  images: string[];
  country?: string;
  name?: string;
  gender?: string;
  phone?: string;
  email?: string;
  user_id: string;
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const isSafari = useRef(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emailClicked, setEmailClicked] = useState(false);
  const [phoneClicked, setPhoneClicked] = useState(false);

  // Detect Safari on component mount
  useEffect(() => {
    isSafari.current = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }, []);

  const fetchProfile = async () => {
    if (!userId) return;
    try {
      const res = await axios.get<Profile>(`/api/profile?user_id=${userId}`);
      setProfile(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  // Safari-optimized image preloading
  const preloadImages = useCallback((images: string[]) => {
    if (isSafari.current) {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, []);

  useEffect(() => {
    if (profile?.images) {
      preloadImages(profile.images);
    }
  }, [profile?.images, preloadImages]);

  // Debounced image switching for Safari performance
  const handleNext = useCallback(() => {
    if (isSafari.current) {
      requestAnimationFrame(() => {
        setCurrentImageIndex((i) => (i + 1) % (profile?.images?.length || 1));
      });
    } else {
      setCurrentImageIndex((i) => (i + 1) % (profile?.images?.length || 1));
    }
  }, [profile?.images?.length]);

  const handlePrev = useCallback(() => {
    if (isSafari.current) {
      requestAnimationFrame(() => {
        setCurrentImageIndex((i) => (i - 1 + (profile?.images?.length || 1)) % (profile?.images?.length || 1));
      });
    } else {
      setCurrentImageIndex((i) => (i - 1 + (profile?.images?.length || 1)) % (profile?.images?.length || 1));
    }
  }, [profile?.images?.length]);

  // Optimized touch handlers for Safari
  const handleTouchEvent = useCallback((e: React.TouchEvent) => {
    if (isSafari.current) {
      e.preventDefault();
    }
  }, []);

  if (!profile) {
    return <div className="flex items-center justify-center h-screen text-black">Loading profile...</div>;
  }

  const age = profile.date_of_birth
    ? differenceInYears(new Date(), new Date(profile.date_of_birth))
    : '?';
  const formattedDob = profile.date_of_birth
    ? format(new Date(profile.date_of_birth), 'dd-MM-yyyy')
    : '?';
  const totalImages = profile.images?.length || 0;

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-4.77rem)] bg-[#FFF5E6] text-black gap-4 p-3 sm:p-4 md:p-6"
      // Safari-specific CSS fixes
      style={{
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* 🟠 Main layout container */}
      <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start justify-center gap-6 w-full max-w-4xl translate-y-0 sm:translate-y-20 md:translate-y-30 lg:translate-y-0">

        {/* 🟢 Info section — appears below Top section on mobile, left on desktop */}
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 md:gap-x-6 w-full text-xs place-items-center text-center mt-4 lg:mt-0 lg:w-1/2">
          {profile.name && (
            <div className="relative w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
              <img 
                src="/idic.svg" 
                alt="Name Icon" 
                className="absolute inset-0 w-full h-full object-contain"
                onTouchStart={handleTouchEvent}
              />
              <span className="relative mt-3 sm:mt-4 md:mt-5 z-10 text-xs sm:text-sm">{profile.name}</span>
            </div>
          )}
          {profile.gender && (
            <div className="relative w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
              <img 
                src="/gendic.svg" 
                alt="Gender Icon" 
                className="absolute inset-0 w-full h-full object-contain"
                onTouchStart={handleTouchEvent}
              />
              <span className="relative mt-3 sm:mt-4 md:mt-5 z-10 text-xs sm:text-sm">{profile.gender}</span>
            </div>
          )}
          {profile.country && (
            <div className="relative w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
              <img 
                src="/conic.svg" 
                alt="Country Icon" 
                className="absolute inset-0 w-full h-full object-contain"
                onTouchStart={handleTouchEvent}
              />
              <span className="relative mt-3 sm:mt-4 md:mt-5 z-10 text-xs sm:text-sm">{profile.country}</span>
            </div>
          )}
          <div className="relative w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center">
            <img 
              src="/bdic.svg" 
              alt="Birthdate Icon" 
              className="absolute inset-0 w-full h-full object-contain"
              onTouchStart={handleTouchEvent}
            />
            <span className="relative mt-3 sm:mt-4 md:mt-5 z-10 text-xs sm:text-sm">{formattedDob}</span>
          </div>
        </div>

        {/* 🔵 Top section — username + photos + contacts */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:w-1/2">
          {/* Username + age */}
          <div className="
            mt-4 sm:mt-16 lg:mt-0 
            text-left h-full 
            lg:absolute lg:top-6 lg:left-6
          ">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl font-semibold -translate-y-0 sm:-translate-y-0 md:-translate-y-8"
            >
              {profile.username} ({age})
            </motion.h1>
          </div>

          {/* Images + Contact */}
          <div className="flex flex-col items-center gap-2">
            {totalImages > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative w-[180px] h-[230px] sm:w-[220px] sm:h-[280px] md:w-[250px] md:h-[320px]"
              >
                {/* Rectangular profile image */}
                <img
                  src={profile.images[currentImageIndex]}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-xl shadow-md"
                  style={{
                    // Safari image rendering optimization
                    imageRendering: '-webkit-optimize-contrast',
                  }}
                />

                {/* Buttons + overlays */}
                {totalImages > 1 && (
                  <>
                    {/* Next / Prev buttons */}
                    <button 
                      onClick={handleNext} 
                      className="absolute top-0 right-0 hover:opacity-70 transition-transform hover:scale-110"
                      onTouchStart={handleTouchEvent}
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#2A5073]" />
                    </button>
                    <button 
                      onClick={handlePrev} 
                      className="absolute bottom-0 left-0 hover:opacity-70 transition-transform hover:scale-110"
                      onTouchStart={handleTouchEvent}
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#2A5073]" />
                    </button>

                    {/* Email bubble */}
                    <div
                      className={`absolute -bottom-9 left-0 sm:bottom-15 sm:-left-42 md:bottom-18 md:-left-48 transition-all duration-500 ease-in-out transform origin-right ${
                        emailClicked ? 'opacity-100 scale-100' : 'opacity-100 scale-0 pointer-events-none'
                      }`}
                    >
                      <div className="relative inline-block">
                        <img src="/smailphic.svg" alt="Small Email" className="block sm:hidden w-40 h-6" />
                        <img
                          src="/clickedmailic.svg"
                          alt="Clicked Email"
                          className="hidden sm:block w-40 h-6 sm:w-50 sm:h-7 md:w-55 md:h-8"
                        />
                        {profile.email && (
                          <p className="absolute top-1/2 left-1.5 -translate-y-1/2 text-[8px] sm:text-[9px] md:text-[10px] text-black font-medium truncate">
                            {profile.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailClicked((prev) => !prev)}
                      className="absolute bottom-14 left-0 sm:bottom-16 md:bottom-20 transition-transform hover:scale-110"
                      onTouchStart={handleTouchEvent}
                    >
                      <img src="/mailic.svg" alt="Email" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                    </button>

                    {/* Phone bubble */}
                    <div
                      className={`absolute -bottom-16 left-8 sm:bottom-7 sm:-left-36 md:bottom-9 md:-left-40 transition-all duration-500 ease-in-out transform origin-right ${
                        phoneClicked ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
                      }`}
                    >
                      <div className="relative inline-block">
                        <img src="/sphphic.svg" alt="Small Phone" className="block sm:hidden w-40 h-6" />
                        <img
                          src="/clickedphic.svg"
                          alt="Clicked Phone"
                          className="hidden sm:block w-40 h-6 sm:w-45 sm:h-7 md:w-50 md:h-8"
                        />
                        {profile.phone && (
                          <p className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] sm:text-xs md:text-sm text-black font-medium truncate">
                            {profile.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setPhoneClicked((prev) => !prev)}
                      className="absolute bottom-7 left-0 sm:bottom-8.5 md:bottom-10.5 transition-transform hover:scale-110"
                      onTouchStart={handleTouchEvent}
                    >
                      <img src="/phic.svg" alt="Phone" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.main>
  );
}