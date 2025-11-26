// src/components/ProfileCard.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
// ✅ Import the SAME types from the hook to avoid "two Profile types"
import { Profile, UserDetails } from '@/types/profile';

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
  handleNextImage
}: ProfileCardProps) {
  return (
    <div className="flex justify-center items-center h-full px-4 pt-20 pb-20 sm:pt-16 sm:pb-4">
      <div className="relative h-full max-h-[80vh] aspect-[9/16] max-w-full mx-auto rounded-3xl">
        {totalImages > 0 && (
          <div className="relative w-full h-full">
            <img
              src={profile.images?.[currentImageIndex] ?? ''}
              className="w-full h-5/6 border-3 border-[#2A5073] object-cover -translate-y-10 rounded-3xl"
              alt="profile"
            />
          </div>
        )}

        {/* Navigation Arrows for Images */}
        {totalImages > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute bg-[#2A5073] border-5 border-[#FFF5E6] rounded-full p-1 -left-5 top-2/3 sm:top-1/3 sm:-left-7 transform z-20"
            >
              <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9 pr-1 text-white" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute bg-[#2A5073] border-5 border-[#FFF5E6] rounded-full p-1 -right-5 top-2/3 sm:top-1/3 sm:-right-7 transform z-20"
            >
              <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9 pl-1 text-white" />
            </button>
          </>
        )}

        <div
          className="
            absolute bg-[#FFF5E6] rounded-3xl
            bottom-0 sm:top-2/3 right-5 -translate-y-1/2
            flex flex-col items-start justify-between
            gap-y-1 sm:gap-y-3
            lg:gap-y-5
            p-1 sm:p-2
            translate-x-0
            sm:translate-x-20
            md:translate-x-23
            scale-75 sm:scale-100
            origin-right
          "
        >
          {profile.gender && (
            <div className="h-5 sm:h-9 pt-1 text-xs sm:text-sm md:text-base bg-[#FCE9CE] rounded-full py-0.5 px-2 sm:py-1 sm:px-3 shadow scale-90 sm:scale-100">
              {profile.gender === 'Male' ? '♂ Male' :
              profile.gender === 'Female' ? '♀ Female' :
              profile.gender === 'Non-binary' ? '⚧ Non-binary' :
              profile.gender === 'Transmale' ? '♂⚧ Transmale' :
              profile.gender === 'Transfemale' ? '⚧♀ Transfemale' :
              profile.gender === 'Prefer not to say' ? '× Prefer not to say' :
              ` ${profile.gender}`}
            </div>
          )}
          {userDetails?.height_cm && (
            <div className="h-5 sm:h-9 pt-1 text-xs sm:text-sm md:text-base bg-[#FCE9CE] rounded-full py-0.5 px-2 sm:py-1 sm:px-3 shadow scale-90 sm:scale-100">
              📏 {userDetails.height_cm}cm
            </div>
          )}
          {userDetails?.weight_kg && (
            <div className="h-5 sm:h-9 pt-1 text-xs sm:text-sm md:text-base bg-[#FCE9CE] rounded-full py-0.5 px-2 sm:py-1 sm:px-3 shadow scale-90 sm:scale-100">
              ⚖️ {userDetails.weight_kg}kg
            </div>
          )}
        </div>

        <div
          className="
            absolute bg-[#FFF5E6] rounded-3xl
            bottom-0 sm:top-2/3 left-5 -translate-y-1/2
            flex flex-col items-end justify-between
            gap-y-1 sm:gap-y-3
            lg:gap-y-5
            p-1 sm:p-2
            -translate-x-0
            sm:-translate-x-38.5
            md:-translate-x-38.5
            scale-75 sm:scale-100
            origin-left
          "
        >
          {userDetails?.location && (
            <div className="h-5 sm:h-9 pt-1 text-xs sm:text-sm md:text-base bg-[#FCE9CE] rounded-full py-0.5 px-2 sm:py-1 sm:px-3 shadow scale-90 sm:scale-100">
              📍 {userDetails.location}
            </div>
          )}

          {userDetails?.sexuality && (
            <div className="h-5 sm:h-9 pt-1 text-xs sm:text-sm md:text-base bg-[#FCE9CE] rounded-full py-0.5 px-2 sm:py-1 sm:px-3 shadow scale-90 sm:scale-100">
              {userDetails.sexuality === 'straight' ? '⇄ Straight' :
              userDetails.sexuality === 'gay' ? '⚣ Gay' :
              userDetails.sexuality === 'bisexual' ? '⚤ Bisexual' :
              userDetails.sexuality === 'other' ? '○ Other' :
              ` ${userDetails.sexuality}`}
            </div>
          )}

          {userDetails?.looking_for && (
            <div className="h-5 sm:h-9 pt-1 text-xs sm:text-sm md:text-base bg-[#FCE9CE] rounded-full py-0.5 px-2 sm:py-1 sm:px-3 shadow scale-90 sm:scale-100">
              👀 {userDetails.looking_for}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
