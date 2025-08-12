// src/app/dms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Friend = {
  user_id: string;
  username: string;
  profile_image: string | null;
  age: number | null;
};

export default function DmsPage() {
  const auth = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [foundUser, setFoundUser] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.push('/login');
    }
  }, [auth.isLoading, auth.user, router]);

  // fetch my friends on load
  useEffect(() => {
    if (!auth.user?.id_token) return;

    const fetchFriends = async () => {
      try {
        const res = await axios.get<Friend[]>('/api/my-friends', {
          headers: { Authorization: `Bearer ${auth.user!.id_token}` },
        });
        setFriends(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch friends error:", err);
      }
    };

    fetchFriends();
  }, [auth.user]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await axios.get<Friend>(`/api/search-user?user_id=${encodeURIComponent(query.trim())}`);
      const user = res.data;
      if (user && typeof user.user_id === 'string') {
        setFoundUser(user);
      } else {
        setFoundUser(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      setFoundUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!auth.user?.id_token) {
      alert("Not authenticated.");
      return;
    }

    if (!foundUser || !foundUser.user_id) {
      alert("No user selected to add.");
      return;
    }

    try {
      await axios.post(
        "/api/add-friend",
        { friend_id: foundUser.user_id },
        { headers: { Authorization: `Bearer ${auth.user.id_token}` } }
      );

      alert("Friend added!");
      setFoundUser(null);
      setQuery("");

      // Refetch friends
      const res = await axios.get<Friend[]>('/api/my-friends', {
        headers: { Authorization: `Bearer ${auth.user.id_token}` },
      });
      setFriends(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Add friend error:", err.response?.data || err.message);
      alert("Failed to add friend: " + (err.response?.data?.error || err.message));
    }
  };

  if (!auth.user) return null;

  return (
    <div className="space-y-6 p-4 max-w-md mx-auto">
      {/* search user */}
      <div className="space-y-4">
        <input
          className="border border-blue-500 rounded-full p-2 w-full"
          placeholder="Enter user ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full w-full"
          onClick={handleSearch}
          disabled={!query.trim() || loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>

        {foundUser && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded w-full space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-3 w-full">
              <img
                src={foundUser.profile_image || "/default-avatar.png"}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="text-lg font-medium">{foundUser.username}</span>
            </div>
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-full w-full sm:w-auto"
              onClick={handleAddFriend}
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* my friends list */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">My Friends</h2>
        {friends.length === 0 && <p className="text-gray-500">No friends yet.</p>}

        {friends.map((friend) => (
          <button
            key={friend.user_id}
            onClick={() => router.push(`/chat/${friend.user_id}`)}
            className="flex items-center p-3 rounded-full w-full hover:bg-yellow-500 transition"
          >
            <img
              src={friend.profile_image || "/default-avatar.png"}
              alt=""
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div className="flex flex-col text-left">
              <span className="font-medium">{friend.username}</span>
              {friend.age !== null && (
                <span className="text-sm text-gray-500">{friend.age} yrs old</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
