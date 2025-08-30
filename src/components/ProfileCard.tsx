// src/components/ProfileCard.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
// ✅ Import the SAME types from the hook to avoid "two Profile types"
import { Profile, UserDetails } from '@/hooks/useProfileInitialization';

interface ProfileCardProps {
  profile: Profile;
  userDetails: UserDetails;
  currentImageIndex: number;
  totalImages: number;
  handlePrevImage: () => void;
  handleNextImage: () => void;
  formattedDob: string;
}

export default function ProfileCard({
  profile,
  userDetails,
  currentImageIndex,
  totalImages,
  handlePrevImage,
  handleNextImage,
  formattedDob
}: ProfileCardProps) {
  return (
    <div className="flex justify-center items-center h-full px-4 pt-20 pb-20 sm:pt-16 sm:pb-4">
      <div className="relative h-full max-h-[80vh] aspect-[9/16] max-w-full mx-auto rounded-3xl overflow-hidden bg-gray-800">
        {totalImages > 0 && (
          <img
            src={profile.images?.[currentImageIndex] ?? ''}
            alt={`Profile ${currentImageIndex + 1}`}
            className="w-full h-full object-cover object-center"
          />
        )}

        {/* Navigation Arrows for Images */}
        {totalImages > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute bg-black/50 rounded-full p-1 left-1 top-1/2 transform -translate-y-1/2 z-20"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300/70" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute bg-black/50 rounded-full p-1 right-1 top-1/2 transform -translate-y-1/2 z-20"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300/70" />
            </button>
          </>
        )}

        {/* Info Overlay */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent px-4 py-4 text-white">
          <div className="max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500/50 scrollbar-track-transparent">
            <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
              {userDetails?.location && (
                <div className="py-1 px-3 bg-yellow-500/70 rounded-full">
                  📍 {userDetails.location}
                </div>
              )}
              {profile.gender && (
                <div className="py-1 px-3 bg-yellow-500/70 rounded-full">
                  {profile.gender === 'Male' ? '♂ Male' : 
                  profile.gender === 'Female' ? '♀ Female' :
                  profile.gender === 'Non-binary' ? '⚧ Non-binary' :
                  profile.gender === 'Transmale' ? '♂⚧ Transmale' :
                  profile.gender === 'Transfemale' ? '⚧♀ Transfemale' :
                  profile.gender === 'Prefer not to say' ? '× Prefer not to say' :
                  ` ${profile.gender}`}
                </div>
              )}
              {userDetails?.sexuality && (
                <div className="py-1 px-3 bg-yellow-500/70 rounded-full">
                  {userDetails.sexuality === 'straight' ? '⇄ Straight' : 
                  userDetails.sexuality === 'gay' ? '⚣ Gay' :
                  userDetails.sexuality === 'bisexual' ? '⚤ Bisexual' :
                  userDetails.sexuality === 'other' ? '○ Other' :
                  ` ${userDetails.sexuality}`}
                </div>
              )}

              <div className="py-1 px-3 bg-yellow-500/70 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                </svg>
                {formattedDob}
              </div>

              {userDetails?.height_cm && (
                <div className="py-1 px-3 bg-yellow-500/70 rounded-full">
                  📏 {userDetails.height_cm}cm
                </div>
              )}
              {userDetails?.weight_kg && (
                <div className="py-1 px-3 bg-yellow-500/70 rounded-full">
                  ⚖️ {userDetails.weight_kg}kg
                </div>
              )}
              {userDetails?.looking_for && (
                <div className="py-1 px-3 bg-yellow-500/70 rounded-full">
                  👀 {userDetails.looking_for}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
