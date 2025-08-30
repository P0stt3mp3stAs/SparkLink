'use client';

import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { differenceInYears, format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Edit, Filter } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import SwipeLimitModal from '@/components/SwipeLimitModal';
import ProfileCard from '@/components/ProfileCard';
import { useProfileInitialization } from '@/hooks/useProfileInitialization';
import { useSwipeManagement } from '@/hooks/useSwipeManagement';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';

interface Filters {
  age: number | null;
  gender: string | null;
  sexuality: string | null;
  lookingFor: string | null;
  height: number | null;
  weight: number | null;
}

export default function GlidePageContent() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract filter parameters from URL
  const filterAge = searchParams.get('age');
  const filterGender = searchParams.get('gender');
  const filterSexuality = searchParams.get('sexuality');
  const filterLookingFor = searchParams.get('lookingFor');
  const filterHeight = searchParams.get('height');
  const filterWeight = searchParams.get('weight');

  // Create filter object
  const filters: Filters = {
    age: filterAge ? parseInt(filterAge) : null,
    gender: filterGender || null,
    sexuality: filterSexuality || null,
    lookingFor: filterLookingFor || null,
    height: filterHeight ? parseInt(filterHeight) : null,
    weight: filterWeight ? parseInt(filterWeight) : null,
  };

  const {
    filteredProfiles,
    userDetailsMap,
    hasDetails,
    loadingError,
    setFilteredProfiles,
    setExcludedUserIds,
  } = useProfileInitialization(filters);

  const paymentManagement = usePaymentManagement();
  const {
    hasPaid,
    setHasPaid,
    showPaymentModal,
    setShowPaymentModal,
    isProcessing,
    setIsProcessing,
    paymentSuccess,
    setPaymentSuccess,
    swipeLimit,
    setSwipeLimit,
    showSwipeLimitModal,
    setShowSwipeLimitModal,
    paymentForm,
    setPaymentForm,
    formErrors,
    setFormErrors,
    getTimeUntilReset,
  } = paymentManagement;

  const {
    currentProfileIndex,
    currentImageIndex,
    handleNextProfile,
    handlePrevProfile,
    handlePrevImage,
    handleNextImage,
  } = useSwipeManagement(
    auth,
    filteredProfiles,
    setFilteredProfiles,
    setExcludedUserIds,
    hasPaid,
    swipeLimit,
    setSwipeLimit,
    setShowSwipeLimitModal
  );

  useEffect(() => {
    const paidStatus = localStorage.getItem('hasPaidForPremium');
    if (paidStatus === 'true') {
      setHasPaid(true);
    }

    const savedSwipeLimit = localStorage.getItem('swipeLimit');
    if (savedSwipeLimit) {
      const limitData = JSON.parse(savedSwipeLimit);
      if (Date.now() > limitData.resetTime) {
        const newLimit = { count: 0, resetTime: Date.now() + 30 * 60 * 1000 };
        setSwipeLimit(newLimit);
        localStorage.setItem('swipeLimit', JSON.stringify(newLimit));
      } else {
        setSwipeLimit(limitData);
      }
    } else {
      const newLimit = { count: 0, resetTime: Date.now() + 30 * 60 * 1000 };
      setSwipeLimit(newLimit);
      localStorage.setItem('swipeLimit', JSON.stringify(newLimit));
    }
  }, [setHasPaid, setSwipeLimit]);

  const handleFilter = () => {
    if (hasPaid) {
      router.push('/filter');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleEditDetails = () => {
    router.push('/details-form');
  };

  const clearFilters = () => {
    router.push('/glide');
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Authenticating...
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Please log in to continue
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-400">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (hasDetails === false) {
    return null;
  }

  if (filteredProfiles.length === 0) {
    const hasActiveFilters = Object.values(filters).some(
      (filter) => filter !== null
    );

    return (
      <div className="min-h-[calc(100vh-80px)] bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {hasActiveFilters
              ? 'Looking For Profiles near you...'
              : 'Looking For Profiles near you...'}
          </h2>
          <p className="text-yellow-500 text-lg font-semibold mb-6">
            {hasActiveFilters
              ? 'Try adjusting your filter criteria'
              : 'Please wait momentarily to find profiles for you'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-yellow-500 text-black px-6 py-3 rounded-md font-medium hover:bg-yellow-600 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  const safeProfileIndex = Math.min(
    currentProfileIndex,
    filteredProfiles.length - 1
  );
  const profile = filteredProfiles[safeProfileIndex];

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error loading profile</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-md"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const userDetails = userDetailsMap[profile.user_id];
  const age = profile.date_of_birth
    ? differenceInYears(new Date(), new Date(profile.date_of_birth))
    : '?';
  const formattedDob = profile.date_of_birth
    ? format(new Date(profile.date_of_birth), 'dd-MM-yyyy')
    : '?';
  const totalImages = profile.images?.length || 0;

  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter !== null
  );

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        paymentSuccess={paymentSuccess}
        setPaymentSuccess={setPaymentSuccess}
        setHasPaid={setHasPaid}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        setShowSwipeLimitModal={setShowSwipeLimitModal}
      />

      <SwipeLimitModal
        showSwipeLimitModal={showSwipeLimitModal}
        setShowSwipeLimitModal={setShowSwipeLimitModal}
        setShowPaymentModal={setShowPaymentModal}
        getTimeUntilReset={getTimeUntilReset}
      />

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <h2 className="text-2xl font-bold text-white bg-black/30 px-4 py-2 rounded-xl">
          {profile.username},{' '}
          <span className="text-xl font-semibold">{age}</span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm bg-black/30 px-3 py-1 rounded-full">
            {currentProfileIndex + 1} / {filteredProfiles.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className={`p-3 rounded-full transition-all ${
                hasPaid
                  ? 'bg-yellow-500 text-black hover:bg-yellow-600 shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={hasPaid ? 'Filter profiles' : 'Upgrade to use filters'}
            >
              <Filter size={20} />
            </button>
            <button
              onClick={handleEditDetails}
              className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              title="Edit your details"
            >
              <Edit size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Indicator */}
      {hasActiveFilters && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-yellow-500/20 px-4 py-1 rounded-full text-sm z-10 border border-yellow-500/50 flex items-center gap-2">
          <span className="text-yellow-400">Filters Active</span>
          <button
            onClick={clearFilters}
            className="text-yellow-300 hover:text-yellow-100 text-xs"
            title="Clear filters"
          >
            ✕
          </button>
        </div>
      )}

      {/* Swipe Counter Display */}
      {!hasPaid && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 px-4 py-2 rounded-full text-sm z-10 border border-yellow-500/50">
          <span className="text-yellow-400">Swipes: </span>
          <span className="font-bold">{swipeLimit.count}/5</span>
          <span className="text-gray-400 ml-2">
            (resets in {getTimeUntilReset()})
          </span>
        </div>
      )}

      {/* Profile Navigation Arrows */}
      <button
        onClick={handlePrevProfile}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 
                  sm:left-4 md:left-6
                  max-sm:left-2 max-sm:top-auto max-sm:bottom-4 max-sm:translate-y-0"
      >
        <svg
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#EF4444" />
          <path
            d="M15 9L9 15M9 9L15 15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        onClick={handleNextProfile}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 
                  sm:right-4 md:right-6
                  max-sm:right-2 max-sm:top-auto max-sm:bottom-4 max-sm:translate-y-0"
      >
        <svg
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#10B981" />
          <path
            d="M7 13L10 16L17 9"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <ProfileCard
        profile={profile}
        userDetails={userDetails}
        currentImageIndex={currentImageIndex}
        totalImages={totalImages}
        handlePrevImage={handlePrevImage}
        handleNextImage={handleNextImage}
        formattedDob={formattedDob}
      />
    </main>
  );
}
