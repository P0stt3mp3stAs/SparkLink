// src/types/profile.ts

export interface Profile {
  user_id: string;
  username: string;
  date_of_birth?: string | null; // nullable, matches DB
  gender?: string | null;
  images?: string[];
}

export interface UserDetails {
  sexuality?: string | null;
  looking_for?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  location?: string;
}

// 👇 Combined type for when you load a full user (used in swipe & admin)
export type UserProfile = Profile & UserDetails;
