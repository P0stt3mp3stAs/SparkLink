'use client';

import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { differenceInYears, format } from 'date-fns';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Copy, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Sparkle from 'react-sparkle';

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
    if (auth.isAuthenticated && auth.user) {
      fetchProfile();
    }
  }, [auth.isAuthenticated, auth.user, fullUserId]); // added fullUserId as dependency

  if (!auth.isAuthenticated || !auth.user || !profile) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  }

  const age = profile.date_of_birth
    ? differenceInYears(new Date(), new Date(profile.date_of_birth))
    : '?';
  const formattedDob = profile.date_of_birth
    ? format(new Date(profile.date_of_birth), 'dd-MM-yyyy')
    : '?';
  const totalImages = profile.images?.length || 0;

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white px-4 pt-6 pb-24 relative overflow-y-auto">
      <Sparkle
        color="yellow"
        fadeOutSpeed={1}
        flickerSpeed="normal"
        minSize={2}
        maxSize={6}
        overflowPx={50}
      />

      <div className="absolute top-4 text-yellow-500 font-bold text-xl">profile</div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden"
      >
        {/* Image Carousel */}
        <div className="relative w-full aspect-[4/6] md:aspect-[4/5] lg:aspect-[9/10] max-h-[80vh]">
          {totalImages > 0 && (
            <motion.img
              key={currentImageIndex}
              src={profile.images[currentImageIndex]}
              alt={`Profile ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Edit Button */}
          <button
            onClick={() => router.push('/editProfile')}
            className="absolute top-3 right-3 bg-yellow-400/80 p-1.5 rounded-full hover:scale-110 transition"
          >
            <Pencil className="w-4 h-4 text-black" />
          </button>

          {/* Overlay Info */}
          <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent text-center space-y-2">
            <h2 className="text-lg md:text-xl font-bold tracking-wide">
              {profile.username}{' '}
              <span className="text-yellow-400 font-bold">{age}</span>
            </h2>

            <div className="flex flex-wrap justify-center gap-1 text-xs md:text-sm">
              {profile.country && <span className="px-2 py-0.5 bg-yellow-500/80 rounded-full">{profile.country}</span>}
              {profile.name && <span className="px-2 py-0.5 bg-yellow-500/80 rounded-full">{profile.name}</span>}
              {profile.gender && <span className="px-2 py-0.5 bg-yellow-500/80 rounded-full">{profile.gender}</span>}
            </div>

            <div className="flex flex-wrap justify-center gap-1 text-xs md:text-sm">
              <span className="px-2 py-0.5 bg-yellow-500/80 rounded-full">{formattedDob}</span>
              {profile.phone && <span className="px-2 py-0.5 bg-yellow-500/80 rounded-full">{profile.phone}</span>}
            </div>

            {profile.email && (
              <div className="px-2 py-0.5 bg-yellow-500/80 rounded-full text-[10px] md:text-xs max-w-[80%] mx-auto break-all">
                {profile.email}
              </div>
            )}
          </div>
        </div>

        {/* Footer User ID */}
        <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs p-2 bg-black/60">
          <span className="font-mono">{profile.user_id.slice(0, 8)}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(profile.user_id);
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
            }}
            className="hover:scale-110 transition"
          >
            <Copy className="w-3 h-3" />
          </button>
          {copied && <span className="text-green-400">Copied!</span>}
        </div>
      </motion.div>

      {/* Navigation Arrows */}
      {totalImages > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 bottom-4 bg-white/50 p-2 rounded-full hover:scale-110 transition sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <ChevronLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 bottom-4 bg-white/50 p-2 rounded-full hover:scale-110 transition sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <ChevronRight className="w-6 h-6 text-yellow-400" />
          </button>
        </>
      )}
    </main>
  );
}
