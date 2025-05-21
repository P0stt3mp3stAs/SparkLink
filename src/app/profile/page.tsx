'use client';

import { useAuth } from 'react-oidc-context';

export default function ProfilePage() {
  const auth = useAuth();

  if (auth.isLoading) return <div className="text-black">Loading profile...</div>;
  if (auth.error) return <div className="text-red-600">Error: {auth.error.message}</div>;

  if (!auth.isAuthenticated || !auth.user) {
    return <div className="text-gray-700">You are not logged in.</div>;
  }

  const { profile } = auth.user;

  return (
    <main className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10 space-y-4 text-black">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div><span className="font-semibold">Username:</span> {String(auth.user.profile?.preferred_username || auth.user.profile?.username || 'N/A')}</div>
      <div><span className="font-semibold">User ID:</span> {profile.sub}</div>
      <div><span className="font-semibold">Name:</span> {profile.name || 'N/A'}</div>
      <div><span className="font-semibold">Email:</span> {profile.email || 'N/A'}</div>
      <div><span className="font-semibold">Phone:</span> {profile.phone_number || 'N/A'}</div>
    </main>
  );
}
