// src/hooks/useProfileInitialization.ts
import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Filters {
  age: number | null;
  gender: string | null;
  sexuality: string | null;
  lookingFor: string | null;
  height: number | null;
  weight: number | null;
}

export function useProfileInitialization(filters: Filters = {
  age: null,
  gender: null,
  sexuality: null,
  lookingFor: null,
  height: null,
  weight: null,
}) {
  const auth = useAuth();
  const router = useRouter();
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [userDetailsMap, setUserDetailsMap] = useState<Record<string, any>>({});
  const [hasDetails, setHasDetails] = useState<boolean | null>(null);
  const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to calculate age from date_of_birth
  const calculateAge = (dateOfBirth: string | Date | null): number | null => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/');
      return;
    }

    const initializeApp = async () => {
      if (isInitialized) return;

      const checkUserDetails = async () => {
        if (!auth.user?.profile?.sub) {
          setLoadingError('No user ID found');
          return;
        }
        
        try {
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
          const res = await axios.get<any[]>('/api/profile/all');
          
          setAllProfiles(res.data);
          const excludedIds = await fetchUserInteractions();
          
          let filtered = res.data.filter(profile => 
            profile.user_id !== auth.user?.profile?.sub
          );

          if (excludedIds.length > 0) {
            filtered = filtered.filter(profile =>
              !excludedIds.includes(profile.user_id)
            );
          }
          
          // Fetch user details for all filtered profiles
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
          const detailsMap: Record<string, any> = {};
          
          detailsResults.forEach(result => {
            if (result.details) {
              detailsMap[result.userId] = result.details;
            }
          });

          setUserDetailsMap(detailsMap);

          // Apply filters across both tables
          const finalFiltered = filtered.filter(profile => {
            const details = detailsMap[profile.user_id];
            
            // Skip if no user details
            if (!details) return false;

            console.log('Checking profile:', profile.username);
            console.log('Profile data:', {
              gender: profile.gender,
              date_of_birth: profile.date_of_birth,
              age: calculateAge(profile.date_of_birth)
            });
            console.log('User details:', {
              sexuality: details.sexuality,
              looking_for: details.looking_for,
              height_cm: details.height_cm,
              weight_kg: details.weight_kg
            });
            console.log('Filters:', filters);

            // 1. GENDER FILTER (from profiles table)
            if (filters.gender !== null && filters.gender !== '') {
              if (!profile.gender || profile.gender.toLowerCase() !== filters.gender.toLowerCase()) {
                console.log('❌ Failed gender filter');
                return false;
              }
            }

            // 2. AGE FILTER (from profiles table - calculate from date_of_birth)
            if (filters.age !== null) {
              const profileAge = calculateAge(profile.date_of_birth);
              if (profileAge === null || profileAge > filters.age) {
                console.log('❌ Failed age filter');
                return false;
              }
            }

            // 3. SEXUALITY FILTER (from user_details table)
            if (filters.sexuality !== null && filters.sexuality !== '') {
              if (!details.sexuality || details.sexuality.toLowerCase() !== filters.sexuality.toLowerCase()) {
                console.log('❌ Failed sexuality filter');
                return false;
              }
            }

            // 4. LOOKING FOR FILTER (from user_details table)
            if (filters.lookingFor !== null && filters.lookingFor !== '') {
              if (!details.looking_for || details.looking_for.toLowerCase() !== filters.lookingFor.toLowerCase()) {
                console.log('❌ Failed looking_for filter');
                return false;
              }
            }

            // 5. HEIGHT FILTER (from user_details table - height_cm)
            if (filters.height !== null) {
              if (!details.height_cm || details.height_cm > filters.height) {
                console.log('❌ Failed height filter');
                return false;
              }
            }

            // 6. WEIGHT FILTER (from user_details table - weight_kg)
            if (filters.weight !== null) {
              if (!details.weight_kg || details.weight_kg > filters.weight) {
                console.log('❌ Failed weight filter');
                return false;
              }
            }

            console.log('✅ Passed all filters');
            return true;
          });

          console.log('Final filtered count:', finalFiltered.length);
          setFilteredProfiles(finalFiltered);
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
  }, [auth.isAuthenticated, auth.isLoading, auth.user, router, isInitialized, filters]);

  return {
    allProfiles,
    filteredProfiles,
    userDetailsMap,
    hasDetails,
    excludedUserIds,
    loadingError,
    isInitialized,
    setFilteredProfiles,
    setExcludedUserIds
  };
}