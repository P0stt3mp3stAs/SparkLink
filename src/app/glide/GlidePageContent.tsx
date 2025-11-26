// src/app/glide/GlidePageContent.tsx
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
import { Toaster } from 'react-hot-toast';

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
      <div className="text-black relative overflow-y-auto top-1/2 -translate-y-1/2 p-4 bg-gradient-to-r from-[#FFF5E6] via-[#FCE9CE] to-[#FFF5E6]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {hasActiveFilters
              ? 'Looking For Profiles near you...'
              : 'Looking For Profiles near you...'}
          </h2>
          <p className="text-black text-lg font-semibold">
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
    <main className="min-h-dvh sm:min-h-[calc(100vh-80px)] bg-[#FFF5E6] text-black relative overflow-hidden">

      <button
        onClick={handleEditDetails}
        className="p-3 right-1/2 bottom-0 rounded-full bg-[#2A5073] text-white hover:bg-[#244665] border-3 border-[#FFF5E6] transition-colors"
        title="Edit your details"
      >
        <Edit size={20} />
      </button>

      <Toaster
        toastOptions={{
          style: {
            background: '#10B981',
            color: '#fff',
            fontWeight: 'bold',
          },
        }}
      />
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
      <div className="absolute top-4 w-[300px] sm:w-[500px] left-1/2 -translate-x-1/2 flex justify-between items-center z-10">
        <h2 className="translate-y-6 translate-x-8 text-sm font-bold text-black bg-[#FFF5E6] px-2 border-2 border-[#2A5073] rounded-full">
          {profile.username},{' '}
          <span>{age}</span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className={`p-3 rounded-full translate-y-12 translate-x-14.5 sm:translate-y-0 sm:translate-x-2 border-3 border-[#FFF5E6] transition-all ${
                hasPaid
                  ? 'bg-[#2A5073] text-white hover:bg-[#244665]'
                  : 'bg-[#FFD700] text-black hover:bg-[#FFDE2A]'
              }`}
              title={hasPaid ? 'Filter profiles' : 'Upgrade to use filters'}
            >
              <Filter size={20} />
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
        <div className="absolute top-2 sm:top-1 left-1/2 transform -translate-x-1/2 bg-[#FCE9CE]/50 px-2 py-1 rounded-full text-[9px] sm:text-[6px] z-10">
          <span className="text-yellow-400">Swipes: </span>
          <span className="font-bold">{swipeLimit.count}/5</span>
          <span className="text-gray-400 ml-2">
            {getTimeUntilReset()}
          </span>
        </div>
      )}

      {/* BUTTONS CONTAINER */}
      <div
        className="
          absolute left-1/2 bottom-10 sm:bottom-10 -translate-x-1/2
          w-[300px] h-[60px]
          flex items-center justify-center
          z-50
        "
      >
        {/* CONNECT BUTTON (CENTER BEHIND) */}
        <img
          src="/connect.svg"
          className="
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            h-10 sm:h-12 z-30
          "
          alt="connect"
        />

        {/* DISLIKE (LEFT) */}
        <button
          onClick={handlePrevProfile}
          className="
            absolute left-10.5 sm:left-5 top-1/2 -translate-y-1/2
            z-40 cursor-pointer
          "
        >
          <img
            src="/dislike.svg"
            className="h-10 sm:h-12"
            alt="dislike"
          />
        </button>

        {/* LIKE (RIGHT) */}
        <button
          onClick={handleNextProfile}
          className="
            absolute right-10.5 sm:right-5 top-1/2 -translate-y-1/2
            z-40 cursor-pointer
          "
        >
          <img
            src="/like.svg"
            className="h-10 sm:h-12"
            alt="like"
          />
        </button>
      </div>

      {/* Profile Card */}
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