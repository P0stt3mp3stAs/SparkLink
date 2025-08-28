// src/app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

interface UserProfile {
  user_id: string;
  username: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  images?: string[];
  created_at?: string;
  height_cm?: number;
  weight_kg?: number;
  location?: string;
  sexuality?: string;
  looking_for?: string;
}

export default function AdminUsersPage() {
  const auth = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Error loading users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (auth.isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Authenticating...</div>;
  }

  if (!auth.isAuthenticated) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Please log in to continue</div>;
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">👥 All Users</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {users.map((user) => (
          <div key={user.user_id} className="bg-gray-900 rounded-xl shadow-lg p-4 flex flex-col items-center text-center border border-gray-700">
            
            {/* Profile Picture */}
            <div className="w-32 h-32 flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden mb-4">
              {user.images && user.images.length > 0 ? (
                <img
                  src={user.images[0]}
                  alt={user.username || "User"}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-1 text-sm">
              <p><span className="font-bold"></span> {user.username}</p>
              {/* <p><span className="font-bold">Name:</span> {user.name || '-'}</p>
              <p><span className="font-bold">Email:</span> {user.email || '-'}</p>
              <p><span className="font-bold">Phone:</span> {user.phone || '-'}</p>
              <p><span className="font-bold">Country:</span> {user.country || '-'}</p> */}
              <p><span className="font-bold"></span> {user.gender || '-'}</p>
              <p><span className="font-bold"></span> {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : '-'}</p>
              {/* <p><span className="font-bold">Joined:</span> {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</p> */}

              {/* Extra from user_details */}
              <p><span className="font-bold"></span> {user.height_cm ? `${user.height_cm} cm` : '-'}</p>
              <p><span className="font-bold"></span> {user.weight_kg ? `${user.weight_kg} kg` : '-'}</p>
              {/* <p><span className="font-bold">Location:</span> {user.location || '-'}</p> */}
              <p><span className="font-bold"></span> {user.sexuality || '-'}</p>
              <p><span className="font-bold"></span> {user.looking_for || '-'}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
