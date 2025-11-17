'use client';

import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { differenceInYears, format } from 'date-fns';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Copy, Pencil } from 'lucide-react';

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

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emailClicked, setEmailClicked] = useState(false);
  const [phoneClicked, setPhoneClicked] = useState(false);

  const fullUserId = auth.user?.profile?.sub;

  const fetchProfile = async () => {
    if (!fullUserId) return;
    try {
      const res = await axios.get<Profile>(`/api/profile?user_id=${fullUserId}`);
      setProfile(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err);
      router.push('/editProfile');
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) fetchProfile();
  }, [auth.isAuthenticated, auth.user, fullUserId]);

  if (!auth.isAuthenticated || !auth.user || !profile) {
    return <div className="flex items-center justify-center h-screen text-black">Loading your profile...</div>;
  }

  const age = profile.date_of_birth
    ? differenceInYears(new Date(), new Date(profile.date_of_birth))
    : '?';
  const formattedDob = profile.date_of_birth
    ? format(new Date(profile.date_of_birth), 'dd-MM-yyyy')
    : '?';
  const totalImages = profile.images?.length || 0;

  const handleNext = () => setCurrentImageIndex((i) => (i + 1) % totalImages);
  const handlePrev = () => setCurrentImageIndex((i) => (i - 1 + totalImages) % totalImages);

  return (
  <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4.77rem)] bg-[#FFF5E6] text-black gap-8 p-4 sm:p-6 md:p-8">
        
        {/* 🟡 Fixed edit button */}
        <button
          onClick={() => router.push('/editProfile')}
          className="fixed top-3 right-3 sm:top-4 sm:right-4 bg-yellow-300 hover:bg-yellow-600 text-white font-bold p-2 sm:p-3 rounded-full shadow-md z-50"
        >
          <Pencil size={16} />
        </button>

        {/* 🟠 Main layout container */}
        <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start justify-center gap-10 w-full max-w-6xl">

        {/* 🟢 Info section — appears below Top section on mobile, left on desktop */}
        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 md:gap-x-8 w-full text-sm sm:text-xl md:text-2xl place-items-center text-center mt-5 lg:mt-0 lg:w-1/2">
          {profile.name && (
            <div className="relative w-25 h-25 sm:w-40 sm:h-40 md:w-40 md:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
              <img src="/idic.svg" alt="Name Icon" className="absolute inset-0 w-full h-full object-contain" />
              <span className="relative mt-4 sm:mt-6 md:mt-7 z-10">{profile.name}</span>
            </div>
          )}
          {profile.gender && (
            <div className="relative w-25 h-25 sm:w-40 sm:h-40 md:w-40 md:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
              <img src="/gendic.svg" alt="Gender Icon" className="absolute inset-0 w-full h-full object-contain" />
              <span className="relative mt-4 sm:mt-6 md:mt-7 z-10">{profile.gender}</span>
            </div>
          )}
          {profile.country && (
            <div className="relative w-25 h-25 sm:w-40 sm:h-40 md:w-40 md:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
              <img src="/conic.svg" alt="Country Icon" className="absolute inset-0 w-full h-full object-contain" />
              <span className="relative mt-4 sm:mt-6 md:mt-7 z-10">{profile.country}</span>
            </div>
          )}
          <div className="relative w-25 h-25 sm:w-40 sm:h-40 md:w-40 md:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
            <img src="/bdic.svg" alt="Birthdate Icon" className="absolute inset-0 w-full h-full object-contain" />
            <span className="relative mt-4 sm:mt-6 md:mt-7 z-10">{formattedDob}</span>
          </div>
        </div>

        {/* 🔵 Top section — username + photos + contacts */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 lg:w-1/2">
          {/* Username + age */}
          <div className="
            mt-5 sm:mt-20 lg:mt-0 
            text-left h-full 
            lg:absolute lg:top-10 lg:left-10
          ">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
              {profile.username} ({age})
            </h1>
          </div>

          {/* Images + Contact */}
          <div className="flex flex-col items-center gap-3">
            {totalImages > 0 && (
              <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[300px] md:h-[300px]">
                <svg viewBox="0 0 300 300" className="absolute top-0 left-0 w-full h-full">
                  <mask id="frame-mask">
                    <image href="/pframe.svg" width="300" height="300" />
                  </mask>
                  <image
                    href={profile.images[currentImageIndex]}
                    width="300"
                    height="300"
                    preserveAspectRatio="xMidYMid slice"
                    mask="url(#frame-mask)"
                  />
                </svg>

                {/* Buttons + overlays */}
                {totalImages > 1 && (
                  <>
                    {/* Next / Prev buttons */}
                    <button onClick={handleNext} className="absolute top-0 right-4 sm:right-5 md:right-6 hover:opacity-70">
                      <img src="/r.svg" alt="Next" className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                    </button>
                    <button onClick={handlePrev} className="absolute bottom-1 left-4 sm:left-5 md:left-6 hover:opacity-70">
                      <img src="/l.svg" alt="Prev" className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                    </button>

                    {/* Email bubble */}
                    <div
                      className={`absolute -bottom-11 left-5 sm:bottom-18.5 sm:-left-48.5 md:bottom-22.5 md:-left-55 transition-all duration-500 ease-in-out transform origin-right ${
                        emailClicked ? 'opacity-100 scale-100' : 'opacity-100 scale-0 pointer-events-none'
                      }`}
                    >
                      <div className="relative inline-block">
                        <img src="/smailphic.svg" alt="Small Email" className="block sm:hidden w-48.3 h-7" />
                        <img
                          src="/clickedmailic.svg"
                          alt="Clicked Email"
                          className="hidden sm:block w-48.3 h-7 sm:w-62 sm:h-9 md:w-71 md:h-10"
                        />
                        {profile.email && (
                          <p className="absolute top-1/2 left-2 -translate-y-1/2 text-[9px] sm:text-[10px] md:text-xs text-black font-medium truncate">
                            {profile.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailClicked((prev) => !prev)}
                      className="absolute bottom-17 left-4 sm:bottom-20 sm:left-5 md:bottom-24 md:left-6"
                    >
                      <img src="/mailic.svg" alt="Email" className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                    </button>

                    {/* Phone bubble */}
                    <div
                      className={`absolute -bottom-20 left-8 sm:bottom-9 sm:-left-41 md:bottom-11 md:-left-44 transition-all duration-500 ease-in-out transform origin-right ${
                        phoneClicked ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'
                      }`}
                    >
                      <div className="relative inline-block">
                        <img src="/sphphic.svg" alt="Small Phone" className="block sm:hidden w-48.3 h-7" />
                        <img
                          src="/clickedphic.svg"
                          alt="Clicked Phone"
                          className="hidden sm:block w-48.3 h-7 sm:w-55 sm:h-9 md:w-60 md:h-10"
                        />
                        {profile.phone && (
                          <p className="absolute top-1/2 left-3 -translate-y-1/2 text-xs sm:text-sm md:text-base text-black font-medium truncate">
                            {profile.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setPhoneClicked((prev) => !prev)}
                      className="absolute bottom-9 left-4 sm:bottom-10.5 sm:left-5 md:bottom-12.5 md:left-6"
                    >
                      <img src="/phic.svg" alt="Phone" className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🟣 Copy section */}
      <div className="absolute top-5 left-5">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(profile.user_id);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="flex items-center gap-1 hover:opacity-70 transition"
          >
            <Copy size={18} />
          </button>
          <span>{profile.user_id.slice(0, 0)}XXXX</span>
          {copied && <span className="text-xs sm:text-sm text-green-700 mt-1">Copied!</span>}
        </div>
      </div>
    </main>
  );
}
