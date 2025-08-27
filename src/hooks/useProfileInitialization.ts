import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export function useProfileInitialization() {
  const auth = useAuth();
  const router = useRouter();
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [userDetailsMap, setUserDetailsMap] = useState<Record<string, any>>({});
  const [hasDetails, setHasDetails] = useState<boolean | null>(null);
  const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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
          
          setFilteredProfiles(filtered);
          
          if (filtered.length === 0) return;

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