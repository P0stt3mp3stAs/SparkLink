'use client';

import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { differenceInYears, format } from 'date-fns';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Copy, ChevronLeft, ChevronRight, Edit, Filter, X, CreditCard, Check, Crown, Lock } from 'lucide-react';

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

interface UserDetails {
  user_id: string;
  height_cm: number;
  weight_kg: number;
  location: string;
  sexuality: string;
  looking_for: string;
}

interface SwipeLimit {
  count: number;
  resetTime: number;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

export default function GlidePage() {
  const auth = useAuth();
  const router = useRouter();
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [userDetailsMap, setUserDetailsMap] = useState<Record<string, UserDetails>>({});
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [hasDetails, setHasDetails] = useState<boolean | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [swipeLimit, setSwipeLimit] = useState<SwipeLimit>({ count: 0, resetTime: 0 });
  const [showSwipeLimitModal, setShowSwipeLimitModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<PaymentFormData>>({});
  const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/');
      return;
    }

    const initializeApp = async () => {
      if (isInitialized) return;

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

      const checkUserDetails = async () => {
        if (!auth.user?.profile?.sub) {
          setLoadingError('No user ID found');
          return;
        }
        
        try {
          const res = await axios.get(`/api/user-details?user_id=${auth.user.profile.sub}`);
          setHasDetails(true);
        } catch (error: any) {
          if (error.response?.status === 404) {
            setHasDetails(false);
            router.push('/details-form');
          } else {
            console.error('Failed to check user details:', error);
            setLoadingError('Failed to load user details');
          }
        }
      };

      const fetchUserInteractions = async () => {
        if (!auth.user?.profile?.sub) return [];
        
        try {
          const res = await axios.get<{ matches: string[]; dismatches: string[]; allInteractions: string[] }>(`/api/user-interactions?user_id=${auth.user.profile.sub}`);
          const { allInteractions } = res.data;
          setExcludedUserIds(allInteractions || []);
          return allInteractions || [];
        } catch (error) {
          console.error('Failed to fetch user interactions:', error);
          return [];
        }
      };

      const fetchAllProfiles = async () => {
        try {
          const res = await axios.get<Profile[]>('/api/profile/all');
          
          // Store all profiles
          setAllProfiles(res.data);
          
          // Get excluded IDs and filter profiles
          const excludedIds = await fetchUserInteractions();
          
          // First filter out current user
          let filtered = res.data.filter(profile => 
            profile.user_id !== auth.user?.profile?.sub
          );

          // Then filter out users you've already interacted with
          if (excludedIds.length > 0) {
            filtered = filtered.filter(profile =>
              !excludedIds.includes(profile.user_id)
            );
          }
          
          setFilteredProfiles(filtered);
          
          if (filtered.length === 0) {
            return;
          }

          // Fetch details for the filtered profiles only
          const detailsPromises = filtered.map(profile =>
            axios.get(`/api/user-details?user_id=${profile.user_id}`)
              .then(response => ({ userId: profile.user_id, details: response.data }))
              .catch(error => {
                if (error.response?.status === 404) {
                  return { userId: profile.user_id, details: null };
                }
                console.error('Failed to fetch user details for:', profile.user_id, error);
                return { userId: profile.user_id, details: null };
              })
          );

          const detailsResults = await Promise.all(detailsPromises);
          const detailsMap: Record<string, UserDetails> = {};
          
          detailsResults.forEach(result => {
            if (result.details) {
              detailsMap[result.userId] = result.details;
            }
          });

          setUserDetailsMap(detailsMap);
          setIsInitialized(true);
        } catch (err) {
          console.error('❌ Failed to fetch profiles:', err);
          setLoadingError('Failed to load profiles');
        }
      };

      if (auth.isAuthenticated && auth.user) {
        try {
          await checkUserDetails();
          await fetchAllProfiles();
        } catch (error) {
          console.error('Initialization error:', error);
          setLoadingError('Failed to initialize app');
        }
      }
    };

    if (!auth.isLoading && !isInitialized) {
      initializeApp();
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user, router, isInitialized]);

  // Function to remove a profile from the displayed list
  const removeProfile = (userId: string) => {
    const newFilteredProfiles = filteredProfiles.filter(profile => profile.user_id !== userId);
    setFilteredProfiles(newFilteredProfiles);
    setExcludedUserIds(prev => [...prev, userId]);
    
    // Adjust current index if needed
    if (newFilteredProfiles.length === 0) {
      setCurrentProfileIndex(0);
    } else if (currentProfileIndex >= newFilteredProfiles.length) {
      setCurrentProfileIndex(newFilteredProfiles.length - 1);
    }
    setCurrentImageIndex(0);
  };

  const handleFilter = () => {
    if (hasPaid) {
      router.push('/filter');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleNextProfile = async () => {
    // Get current user ID and profile ID for matching
    const myUserId = auth.user?.profile?.sub;
    const currentProfile = filteredProfiles[currentProfileIndex];
    
    if (!currentProfile) return;

    const profileUserId = currentProfile.user_id;
    
    // Handle match action if user is authenticated and profile exists
    if (myUserId && profileUserId) {
      try {
        await axios.post('/api/match-dismatch', {
          userId: myUserId,
          targetUserId: profileUserId,
          action: 'match'
        });
        
        console.log('Added to matches');
        
        // Check swipe limit for non-premium users
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
        
        // Remove the profile from display immediately
        removeProfile(profileUserId);
        return;
      } catch (error) {
        console.error('Failed to add to matches:', error);
      }
    }

    // For premium users or if match API fails, just navigate
    setCurrentProfileIndex((prev) => (prev + 1) % filteredProfiles.length);
    setCurrentImageIndex(0);
  };

  const handlePrevProfile = async () => {
    // Get current user ID and profile ID
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
      
      console.log('Added to dismatches');
      // Remove the profile from display immediately
      removeProfile(profileUserId);
    } catch (error) {
      console.error('Failed to add to dismatches:', error);
      // Still navigate even if API call fails
      setCurrentProfileIndex((prev) => (prev - 1 + filteredProfiles.length) % filteredProfiles.length);
      setCurrentImageIndex(0);
    }
  };

  const validateForm = () => {
    const errors: Partial<PaymentFormData> = {};
    
    if (!paymentForm.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!paymentForm.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      errors.expiryDate = 'Please use MM/YY format';
    }
    
    if (!paymentForm.cvv.match(/^\d{3,4}$/)) {
      errors.cvv = 'Please enter a valid CVV';
    }
    
    if (paymentForm.name.trim().length < 2) {
      errors.name = 'Please enter your name as it appears on card';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        setHasPaid(true);
        localStorage.setItem('hasPaidForPremium', 'true');
        setShowPaymentModal(false);
        setShowSwipeLimitModal(false);
        setPaymentSuccess(false);
        setPaymentForm({ cardNumber: '', expiryDate: '', cvv: '', name: '' });
      }, 1500);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches ? matches[0] : '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value).slice(0, 19);
    } else if (field === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
                .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setPaymentForm(prev => ({ ...prev, [field]: formattedValue }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getTimeUntilReset = () => {
    const timeLeft = swipeLimit.resetTime - Date.now();
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const handleEditDetails = () => {
    router.push('/details-form');
  };

  if (auth.isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Authenticating...</div>;
  }

  if (!auth.isAuthenticated || !auth.user) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Please log in to continue</div>;
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
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Looking For Profiles near you...</h2>
          <p className="text-gray-400">You've seen all available profiles or there are no other users.</p>
        </div>
      </div>
    );
  }

  // Add safety check for currentProfileIndex
  const safeProfileIndex = Math.min(currentProfileIndex, filteredProfiles.length - 1);
  const profile = filteredProfiles[safeProfileIndex];

  // If somehow profile is still undefined, show error
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

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 mb-15">
  <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-4 max-w-sm w-full mx-3 border border-yellow-500/50 shadow-xl">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold text-yellow-400">✨ Unlock Premium</h3>
      <button 
        onClick={() => {
          setShowPaymentModal(false);
          setFormErrors({});
        }}
        className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
        disabled={isProcessing}
      >
        <X size={20} />
      </button>
    </div>

    {paymentSuccess ? (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-white" />
        </div>
        <h4 className="text-xl font-bold text-green-400 mb-2">Payment Successful!</h4>
        <p className="text-gray-200 text-base">You now have unlimited swipes and filters. 🎉</p>
      </div>
    ) : isProcessing ? (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <h4 className="text-lg font-bold text-yellow-400 mb-2">Processing Payment</h4>
        <p className="text-gray-300 text-sm">Please wait while we secure your transaction...</p>
      </div>
    ) : (
      <>
        <div className="mb-4">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-lg mb-4">
            <h4 className="text-white font-bold text-base text-center">
              💎 Premium Membership - $4.99/month
            </h4>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center bg-gray-700 p-2 rounded-lg text-sm">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <Check size={12} className="text-white" />
              </div>
              <span className="text-gray-200">Unlimited right swipes</span>
            </div>
            <div className="flex items-center bg-gray-700 p-2 rounded-lg text-sm">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <Check size={12} className="text-white" />
              </div>
              <span className="text-gray-200">Advanced filters</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-gray-900 p-4 rounded-lg mb-3 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-200 text-base">💳 Payment Details</h4>
              <div className="flex items-center gap-1 bg-green-900/30 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400">Secure</span>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-300 mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 transition-colors text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentForm.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={paymentForm.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={paymentForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={handlePayment}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-base shadow-md"
          >
            <CreditCard size={18} />
            Pay $4.99 Now
          </button>
          <button
            onClick={() => {
              setShowPaymentModal(false);
              setFormErrors({});
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
          >
            Maybe Later
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
            <Lock className="w-3 h-3" />
            <span>This is a demo - no real payment will be processed</span>
          </div>
        </div>
      </>
    )}
  </div>
</div>

      )}

      {/* Swipe Limit Modal */}
      {showSwipeLimitModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border-2 border-red-500/50 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-red-400">⏰ Swipe Limit Reached</h3>
              <button 
                onClick={() => setShowSwipeLimitModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-red-500/20 p-4 rounded-xl mb-6 text-center">
                <p className="text-red-200 text-lg font-semibold">
                  You've used all 5 free swipes!
                </p>
              </div>
              
              <p className="text-gray-300 text-center mb-6">
                Next swipes available in: 
                <span className="text-yellow-400 font-bold ml-2">{getTimeUntilReset()}</span>
              </p>
              
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-xl mb-4">
                <p className="text-white text-center font-bold text-lg">
                  🚀 Upgrade for Unlimited Swipes!
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowSwipeLimitModal(false);
                  setShowPaymentModal(true);
                }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
              >
                <Crown size={22} />
                Get Unlimited - $4.99
              </button>
              <button
                onClick={() => setShowSwipeLimitModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Wait for Free Swipes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <h2 className="text-2xl font-bold text-white bg-black/30 px-4 py-2 rounded-xl">
          {profile.username}, <span className="text-xl font-semibold">{age}</span>
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
                  ? "bg-yellow-500 text-black hover:bg-yellow-600 shadow-lg" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              title={hasPaid ? "Filter profiles" : "Upgrade to use filters"}
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

      {/* Swipe Counter Display */}
      {!hasPaid && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 px-4 py-2 rounded-full text-sm z-10 border border-yellow-500/50">
          <span className="text-yellow-400">Swipes: </span>
          <span className="font-bold">{swipeLimit.count}/5</span>
          <span className="text-gray-400 ml-2">(resets in {getTimeUntilReset()})</span>
        </div>
      )}

      {/* Profile Navigation Arrows - Responsive */}
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

      {/* Carousel with Info Overlay */}
      <div className="flex justify-center items-center h-full px-4 pt-20 pb-20 sm:pt-16 sm:pb-4">
        <div className="relative h-full max-h-[80vh] aspect-[9/16] max-w-full mx-auto rounded-3xl overflow-hidden bg-gray-800">
          {totalImages > 0 && (
            <img
              src={profile.images[currentImageIndex]}
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
    </main>
  );
}