// src/app/dms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/navigation';
import axios from "axios";

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

  // Fetch my friends on load
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
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        console.error("Add friend error:", (err as { message: string }).message);
        alert("Failed to add friend: " + (err as { message: string }).message);
      } else {
        console.error("Add friend error:", err);
        alert("Failed to add friend: Unknown error");
      }
    }
  };

  if (!auth.user) return null;

  return (
    <div className="space-y-6 p-4 w-full sm:w-[60%] mx-auto">
      {/* Search user */}
      <div className="space-y-4">
        <div className="flex w-full space-x-2">
          <input
            className="border border-[#2A5073] text-black rounded-full p-2 w-4/5"
            placeholder="Enter user ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="bg-[#2A5073] hover:bg-[#376a9a] text-white px-4 py-2 rounded-full w-1/5 flex items-center justify-center"
            onClick={handleSearch}
            disabled={!query.trim() || loading}
          >
            {/* On small screens show the icon */}
            <img
              src="/search.svg"
              alt="Search"
              className="w-5 h-5 sm:hidden"
            />

            {/* On sm and up show text */}
            <span className="hidden sm:block">
              {loading ? "..." : "Search"}
            </span>
          </button>
        </div>

        {foundUser && (
        <div className="flex items-center justify-between p-4 rounded-xl w-full space-x-4 bg-gradient-to-r from-[#FCE9CE] to-[#FFF5E6]">
          {/* Left: user info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img
              src={foundUser.profile_image || "/default-avatar.png"}
              alt={foundUser.username}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#FCE9CE]"
            />
            <span className="text-black text-lg font-medium truncate">
              {foundUser.username}
            </span>
          </div>

          {/* Right: + button */}
          <button
            className="flex items-center justify-center bg-[#2A5073] hover:bg-[#376a9a] text-white text-xl font-bold w-10 h-10 rounded-full flex-shrink-0"
            onClick={handleAddFriend}
          >
            +
          </button>
        </div>
      )}
      </div>

      {/* My friends list (with gradient background) */}
      <div
        className="
          space-y-2 p-4 rounded-2xl
          bg-gradient-to-b from-[#FCE9CE] to-[#FFF5E6]
        "
      >
        <h2 className="text-xl text-black font-bold">My Friends</h2>
        {friends.length === 0 && <p className="text-black">No friends yet.</p>}

        <div className="flex flex-col space-y-2">
          {friends.map((friend) => (
            <button
              key={friend.user_id}
              onClick={() => router.push(`/chat/${friend.user_id}`)}
              className="flex items-center p-3 rounded-full w-full hover:bg-[#FFD700] transition"
            >
              <img
                src={friend.profile_image || "/default-avatar.png"}
                alt=""
                className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-[#FCE9CE]"
              />
              <div className="flex flex-col text-left">
                <span className="text-black font-medium">{friend.username}</span>
                {friend.age !== null && (
                  <span className="text-sm text-gray-500">{friend.age} yrs old</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
