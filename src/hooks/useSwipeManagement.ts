// src/hooks/useSwipeManagement.ts
import { useState } from 'react';
import axios from 'axios';
import { UserProfile } from '@/types/profile';
import { AuthContextProps } from 'react-oidc-context';

interface SwipeLimit {
  count: number;
  resetTime: number;
}

export function useSwipeManagement(
  auth: AuthContextProps,
  filteredProfiles: UserProfile[],
  setFilteredProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>,
  setExcludedUserIds: React.Dispatch<React.SetStateAction<string[]>>,
  hasPaid: boolean,
  swipeLimit: SwipeLimit,
  setSwipeLimit: React.Dispatch<React.SetStateAction<SwipeLimit>>,
  setShowSwipeLimitModal: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const removeProfile = (userId: string) => {
    const newFilteredProfiles = filteredProfiles.filter(profile => profile.user_id !== userId);
    setFilteredProfiles(newFilteredProfiles);
    setExcludedUserIds(prev => [...prev, userId]);

    if (newFilteredProfiles.length === 0) {
      setCurrentProfileIndex(0);
    } else if (currentProfileIndex >= newFilteredProfiles.length) {
      setCurrentProfileIndex(newFilteredProfiles.length - 1);
    }
    setCurrentImageIndex(0);
  };

  // src/hooks/useSwipeManagement.ts - COMPLETE CORRECT VERSION
const handleNextProfile = async () => {
  const myUserId = auth.user?.profile?.sub;
  const currentProfile = filteredProfiles[currentProfileIndex];

  if (!currentProfile) return;

  const profileUserId = currentProfile.user_id;

  if (myUserId && profileUserId) {
    try {
      await axios.post('/api/match-dismatch', {
        userId: myUserId,
        targetUserId: profileUserId,
        action: 'match'
      });

      // CALL THE SYNC API AFTER A MATCH
      try {
        if (auth.user?.id_token) {
          await axios.post('/api/sync-matches-to-friends', {}, {
            headers: {
              'Authorization': `Bearer ${auth.user.id_token}`,
            }
          });
        }
      } catch (syncError) {
        console.error('Failed to sync matches to friends:', syncError);
      }

      if (!hasPaid) {
        const newCount = swipeLimit.count + 1;
        const newSwipeLimit = { ...swipeLimit, count: newCount };
        setSwipeLimit(newSwipeLimit);
        localStorage.setItem('swipeLimit', JSON.stringify(newSwipeLimit));

        if (newCount >= 5) {
          setShowSwipeLimitModal(true);
          return; // STOP HERE if swipe limit reached
        }
      }

      removeProfile(profileUserId);
      return; // STOP HERE after successful match
    } catch (error) {
      console.error('Failed to add to matches:', error);
    }
  }

  // Only reach here if no user ID or error occurred
  setCurrentProfileIndex(prev => (prev + 1) % filteredProfiles.length);
  setCurrentImageIndex(0);
};

  const handlePrevProfile = async () => {
    const myUserId = auth.user?.profile?.sub;
    const currentProfile = filteredProfiles[currentProfileIndex];

    if (!currentProfile) {
      setCurrentProfileIndex(prev => (prev - 1 + filteredProfiles.length) % filteredProfiles.length);
      setCurrentImageIndex(0);
      return;
    }

    const profileUserId = currentProfile.user_id;

    try {
      await axios.post('/api/match-dismatch', {
        userId: myUserId,
        targetUserId: profileUserId,
        action: 'dismatch'
      });

      removeProfile(profileUserId);
    } catch (error) {
      console.error('Failed to add to dismatches:', error);
      setCurrentProfileIndex(prev => (prev - 1 + filteredProfiles.length) % filteredProfiles.length);
      setCurrentImageIndex(0);
    }
  };

  const handlePrevImage = () => {
    const totalImages = filteredProfiles[currentProfileIndex]?.images?.length || 0;
    setCurrentImageIndex(prev => (prev - 1 + totalImages) % totalImages);
  };

  const handleNextImage = () => {
    const totalImages = filteredProfiles[currentProfileIndex]?.images?.length || 0;
    setCurrentImageIndex(prev => (prev + 1) % totalImages);
  };

  return {
    currentProfileIndex,
    currentImageIndex,
    handleNextProfile,
    handlePrevProfile,
    handlePrevImage,
    handleNextImage,
    setCurrentProfileIndex,
    setCurrentImageIndex
  };
}