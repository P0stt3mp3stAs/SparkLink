import { useState } from 'react';
import axios from 'axios';

export function useSwipeManagement(auth: any, filteredProfiles: any[], setFilteredProfiles: any, setExcludedUserIds: any, hasPaid: boolean, swipeLimit: any, setSwipeLimit: any, setShowSwipeLimitModal: any) {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const removeProfile = (userId: string) => {
    const newFilteredProfiles = filteredProfiles.filter(profile => profile.user_id !== userId);
    setFilteredProfiles(newFilteredProfiles);
    setExcludedUserIds((prev: string[]) => [...prev, userId]);
    
    if (newFilteredProfiles.length === 0) {
      setCurrentProfileIndex(0);
    } else if (currentProfileIndex >= newFilteredProfiles.length) {
      setCurrentProfileIndex(newFilteredProfiles.length - 1);
    }
    setCurrentImageIndex(0);
  };

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
        
        if (!hasPaid) {
          const newCount = swipeLimit.count + 1;
          const newSwipeLimit = { ...swipeLimit, count: newCount };
          setSwipeLimit(newSwipeLimit);
          localStorage.setItem('swipeLimit', JSON.stringify(newSwipeLimit));

          if (newCount >= 5) {
            setShowSwipeLimitModal(true);
            return;
          }
        }
        
        removeProfile(profileUserId);
        return;
      } catch (error) {
        console.error('Failed to add to matches:', error);
      }
    }

    setCurrentProfileIndex((prev) => (prev + 1) % filteredProfiles.length);
    setCurrentImageIndex(0);
  };

  const handlePrevProfile = async () => {
    const myUserId = auth.user?.profile?.sub;
    const currentProfile = filteredProfiles[currentProfileIndex];
    
    if (!currentProfile) {
      setCurrentProfileIndex((prev) => (prev - 1 + filteredProfiles.length) % filteredProfiles.length);
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
      setCurrentProfileIndex((prev) => (prev - 1 + filteredProfiles.length) % filteredProfiles.length);
      setCurrentImageIndex(0);
    }
  };

  const handlePrevImage = () => {
    const totalImages = filteredProfiles[currentProfileIndex]?.images?.length || 0;
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNextImage = () => {
    const totalImages = filteredProfiles[currentProfileIndex]?.images?.length || 0;
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
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