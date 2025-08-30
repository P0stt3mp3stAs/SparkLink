// src/hooks/useProfileInitialization.ts
import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Profile as ProfileType, UserDetails as UserDetailsType } from '@/types/profile';

export interface Filters {
  age: number | null;
  gender: string | null;
  sexuality: string | null;
  lookingFor: string | null;
  height: number | null;
  weight: number | null;
}

type UserDetailsMap = Record<string, UserDetailsType>;

export function useProfileInitialization(
  filters: Filters = {
    age: null,
    gender: null,
    sexuality: null,
    lookingFor: null,
    height: null,
    weight: null,
  }
) {
  const auth = useAuth();
  const router = useRouter();

  const [allProfiles, setAllProfiles] = useState<ProfileType[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileType[]>([]);
  const [userDetailsMap, setUserDetailsMap] = useState<UserDetailsMap>({});
  const [hasDetails, setHasDetails] = useState<boolean | null>(null);
  const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate age from date_of_birth
  const calculateAge = (dob: string | null | undefined): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/');
      return;
    }

    const initializeApp = async () => {
      if (isInitialized) return;

      // 1️⃣ Check if current user has details
      const checkUserDetails = async () => {
        if (!auth.user?.profile?.sub) {
          setLoadingError('No user ID found');
          return;
        }
        try {
          setHasDetails(true);
        } catch (error: unknown) {
          if (
            typeof error === 'object' &&
            error !== null &&
            'response' in error &&
            (error as { response?: { status?: number } }).response?.status === 404
          ) {
            setHasDetails(false);
            router.push('/details-form');
          } else {
            console.error('Failed to check user details:', error);
            setLoadingError('Failed to load user details');
          }
        }
      };

      // 2️⃣ Fetch all user interactions
      const fetchUserInteractions = async (): Promise<string[]> => {
        if (!auth.user?.profile?.sub) return [];
        try {
          const res = await axios.get<{
            matches: string[];
            dismatches: string[];
            allInteractions: string[];
          }>(`/api/user-interactions?user_id=${auth.user.profile.sub}`);
          const { allInteractions } = res.data;
          setExcludedUserIds(allInteractions || []);
          return allInteractions || [];
        } catch (error) {
          console.error('Failed to fetch user interactions:', error);
          return [];
        }
      };

      // 3️⃣ Fetch all profiles and their user details
      const fetchAllProfiles = async () => {
        try {
          const res = await axios.get<ProfileType[]>('/api/profile/all');

          // Normalize nulls to undefined for TS compatibility
          const normalizedProfiles: ProfileType[] = res.data.map(p => ({
            ...p,
            gender: p.gender ?? undefined,
            date_of_birth: p.date_of_birth ?? undefined,
            images: p.images ?? [],
          }));

          setAllProfiles(normalizedProfiles);
          const excludedIds = await fetchUserInteractions();

          let filtered = normalizedProfiles.filter(
            profile => profile.user_id !== auth.user?.profile?.sub
          );

          if (excludedIds.length > 0) {
            filtered = filtered.filter(profile => !excludedIds.includes(profile.user_id));
          }

          // Fetch user details for filtered profiles
          const detailsResults = await Promise.all(
            filtered.map(profile =>
              axios
                .get<UserDetailsType>(`/api/user-details?user_id=${profile.user_id}`)
                .then(res => ({ userId: profile.user_id, details: res.data }))
                .catch((err: unknown) => {
                  if (
                    typeof err === 'object' &&
                    err !== null &&
                    'response' in err &&
                    (err as { response?: { status?: number } }).response?.status === 404
                  ) {
                    return { userId: profile.user_id, details: null };
                  }
                  console.error('Failed to fetch user details for', profile.user_id, err);
                  return { userId: profile.user_id, details: null };
                })
            )
          );

          const detailsMap: UserDetailsMap = {};
          detailsResults.forEach(r => {
            if (r.details) detailsMap[r.userId] = r.details;
          });

          setUserDetailsMap(detailsMap);

          // 4️⃣ Apply filters
          const finalFiltered = filtered.filter(profile => {
            const details = detailsMap[profile.user_id];
            if (!details) return false;

            if (filters.gender && profile.gender?.toLowerCase() !== filters.gender.toLowerCase()) return false;
            if (filters.age !== null) {
              const age = calculateAge(profile.date_of_birth);
              if (age === null || age > filters.age) return false;
            }
            if (filters.sexuality && details.sexuality?.toLowerCase() !== filters.sexuality.toLowerCase()) return false;
            if (filters.lookingFor && details.looking_for?.toLowerCase() !== filters.lookingFor.toLowerCase()) return false;
            if (filters.height !== null && (!details.height_cm || details.height_cm > filters.height)) return false;
            if (filters.weight !== null && (!details.weight_kg || details.weight_kg > filters.weight)) return false;

            return true;
          });

          setFilteredProfiles(finalFiltered);
          setIsInitialized(true);
        } catch (err) {
          console.error('Failed to fetch profiles:', err);
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

    if (!auth.isLoading && !isInitialized) initializeApp();
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
    setExcludedUserIds,
  };
}
