'use client';

import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { differenceInYears, format } from 'date-fns';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Copy, Pencil, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fullUserId = auth.user?.profile?.sub;

  const fetchProfile = async () => {
    if (!fullUserId) return;
    try {
      const res = await axios.get(`/api/profile?user_id=${fullUserId}`);
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
  }, [auth.isAuthenticated, auth.user]);

  if (!auth.isAuthenticated || !auth.user || !profile) return <div className="text-white">Loading...</div>;

  const age = profile.date_of_birth ? differenceInYears(new Date(), new Date(profile.date_of_birth)) : '?';
  const formattedDob = profile.date_of_birth ? format(new Date(profile.date_of_birth), 'dd-MM-yyyy') : '?';
  const totalImages = profile.images?.length || 0;

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  return (
    <main className="h-full bg-black text-white relative overflow-hidden">
      {/* Top Header */}
      <div className="absolute top-1/24 left-1/5 right-1/5 flex justify-between items-center z-10">
        <h2 className="text-3xl font-bold italic">
          {profile.username}, <span className="text-xl font-semibold not-italic">{age}</span>
        </h2>
        <button onClick={() => router.push('/editProfile')}><Pencil className="w-6 h-6" /></button>
      </div>

      {/* Arrows */}
      {totalImages > 1 && (
        <>
          <button onClick={handlePrev} className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20">
            <ChevronLeft className="w-24 h-24 text-yellow-500" />
          </button>
          <button onClick={handleNext} className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20">
            <ChevronRight className="w-24 h-24 text-yellow-500" />
          </button>
        </>
      )}

      {/* Carousel with Info Overlay */}
      <div className="flex justify-center items-center h-full px-4 ">
      <div className="relative h-4/5 aspect-[9/16] max-w-[90%] mx-auto rounded-[80px] overflow-hidden bg-gray-800">
          {totalImages > 0 && (
            <img
              src={profile.images[currentImageIndex]}
              alt={`Profile ${currentImageIndex + 1}`}
              className="w-full h-full object-cover object-center"
            />
          )}

          {/* Info Overlay */}
          <div className="absolute bottom-0 w-full bg-black/60 px-4 py-6 text-white text-base font-semibold italic flex flex-col items-center gap-3">
            {/* Top row: Country, Name, Gender */}
            <div className="flex flex-wrap justify-center gap-2 w-full">
              <div className="py-1.5 px-4 bg-yellow-500/70 rounded-full">{profile.country}</div>
              <div className="py-1.5 px-4 bg-yellow-500/70 rounded-full">{profile.name}</div>
              <div className="py-1.5 px-4 bg-yellow-500/70 rounded-full">{profile.gender}</div>
            </div>

            {/* Middle row: DOB + Phone */}
            <div className="flex flex-wrap justify-center gap-2 w-full">
              <div className="py-1.5 px-4 bg-yellow-500/70 rounded-full">{formattedDob}</div>
              <div className="py-1.5 px-4 bg-yellow-500/70 rounded-full">{profile.phone}</div>
            </div>

            {/* Bottom row: Email */}
            <div className="py-1.5 px-4 bg-yellow-500/70 rounded-full text-center break-all max-w-full">
              {profile.email}
            </div>
          </div>
        </div>
      </div>

      {/* Copy User ID */}
      <div className="absolute bottom-2 right-4 text-xs flex items-center gap-2 italic">
        <span className="font-mono text-white">{profile.user_id.slice(0, 8)}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(profile.user_id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
          }}
        >
          <Copy className="w-4 h-4 text-white" />
        </button>
        {copied && <span className="text-green-400">Copied!</span>}
      </div>

      {/* Settings Icon */}
      <button
        onClick={() => router.push('/settings')}
        className="absolute bottom-4 left-4 text-white"
      >
        <Settings className="w-6 h-6" />
      </button>
    </main>
  );
}
