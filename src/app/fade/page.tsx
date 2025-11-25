// src/app/fade/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { v4 as uuidv4 } from 'uuid';
import { Heart, MessageCircle, Share2, Upload, X } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Toast {
  id: string;
  message: string;
}

interface Comment {
  user: string; // still store the ID
  name?: string; // optional display name
  text: string;
}

interface OwnerProfile {
  profile_image?: string | null;
  username?: string | null;
}

interface RawVideo {
  id?: string;
  user_id?: string;
  video_url?: string;
  description?: string | null;
  created_at?: string;
  likes?: number;
  liked_by?: string[];
  shares?: number;
  shared_by?: string[];
  comments?: Comment[];
}

interface Video {
  id: string;
  user_id: string;
  video_url: string;
  description?: string | null;
  created_at?: string;
  likes: number;
  liked_by: string[];
  shares: number;
  shared_by: string[];
  comments: Comment[];
  owner?: OwnerProfile | null;
}

export default function FadePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [commentText, setCommentText] = useState('');
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const router = useRouter();
  const auth = useAuth();
  const userId = auth.user?.profile?.sub;
  const [isMuted, setIsMuted] = useState(false);
  // const [isPlaying, setIsPlaying] = useState(false);

  const showToast = (message: string) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2000);
  };

  // Fetch videos (and owner profiles) once on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // helper to fetch owner profile for a video user_id
        const fetchUserProfile = async (uId?: string): Promise<OwnerProfile | null> => {
          if (!uId) return null;
          try {
            const res = await fetch(`/api/search-user?user_id=${uId}`);
            if (!res.ok) return null;
            const userData = await res.json();
            return userData as OwnerProfile;
          } catch (err) {
            console.error('Failed to fetch profile for user', uId, err);
            return null;
          }
        };

        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching videos:', error);
          return;
        }

        const videosData = (data as RawVideo[]) || [];

        const videosWithProfiles: Video[] = await Promise.all(
          videosData.map(async (rv) => {
            const owner = await fetchUserProfile(rv.user_id);
            return {
              id: rv.id ?? '',
              user_id: rv.user_id ?? '',
              video_url: rv.video_url ?? '',
              description: rv.description ?? null,
              created_at: rv.created_at ?? undefined,
              likes: rv.likes ?? 0,
              liked_by: rv.liked_by ?? [],
              shares: rv.shares ?? 0,
              shared_by: rv.shared_by ?? [],
              comments: rv.comments ?? [],
              owner: owner ?? null,
            };
          })
        );

        setVideos(videosWithProfiles);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
      }
    };

    // IIFE to call async inside useEffect
    (async () => {
      await fetchVideos();
    })();
  }, []);

  // IntersectionObserver to auto-play/pause visible videos
  useEffect(() => {
    if (!videoRefs.current.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const vid = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    // snapshot the refs to ensure stable cleanup
    const currentVideos = [...videoRefs.current];
    currentVideos.forEach((v) => {
      if (v) observer.observe(v);
    });

    return () => {
      currentVideos.forEach((v) => {
        if (v) observer.unobserve(v);
      });
    };
  }, [videos]);

  const handleLike = async (videoId: string) => {
  if (!userId) return showToast('You must be logged in to like.');
  if (!videoId) return;

  // Optimistic UI update
  setVideos((prev) =>
    prev.map((v) => {
      if (v.id !== videoId) return v;
      const likedBy = v.liked_by ?? [];
      let newLikes = v.likes ?? 0;
      let updatedLikedBy = [...likedBy];

      if (likedBy.includes(userId)) {
        updatedLikedBy = likedBy.filter((id) => id !== userId);
        newLikes = Math.max(newLikes - 1, 0);
      } else {
        updatedLikedBy = [...likedBy, userId];
        newLikes = newLikes + 1;
      }

      return { ...v, likes: newLikes, liked_by: updatedLikedBy };
    })
  );

  // Persist to Supabase
  const updated = videos.find((v) => v.id === videoId);
  if (updated) {
    const { error } = await supabase
      .from('videos')
      .update({ likes: updated.likes, liked_by: updated.liked_by })
      .eq('id', videoId)
      .select(); // optional
    if (error) console.error('Failed to update like:', error);
  }
};


  const handleShare = async (videoId: string) => {
    if (!userId) return showToast('You must be logged in to share.');
    if (!videoId) return;

    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    const sharedBy = video.shared_by ?? [];
    let updatedSharedBy = [...sharedBy];
    let updatedShares = video.shares ?? 0;

    navigator.clipboard.writeText(video.video_url).then(() => showToast('Video link copied!')).catch(() => showToast('Failed to copy link.'));

    if (!sharedBy.includes(userId)) {
      updatedSharedBy = [...sharedBy, userId];
      updatedShares = updatedSharedBy.length;

      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, shares: updatedShares, shared_by: updatedSharedBy } : v))
      );

      const { error } = await supabase.from('videos').update({ shares: updatedShares, shared_by: updatedSharedBy }).eq('id', videoId);
      if (error) console.error('Failed to update share:', error);
    }
  };

  const openComments = (video: Video) => {
    setActiveVideo(video);
    setCommentText('');
  };

  const submitComment = async () => {
    if (!userId) return showToast('You must be logged in to comment.');
    if (!commentText.trim()) return;
    if (!activeVideo || !activeVideo.id) return;

    const userName = auth.user?.profile?.name || 'Unknown';

    const newComments: Comment[] = [
      ...(activeVideo.comments ?? []),
      { user: userId, name: userName, text: commentText.trim() },
    ];


    // optimistic updates
    setVideos((prev) => prev.map((v) => (v.id === activeVideo.id ? { ...v, comments: newComments } : v)));
    setActiveVideo((prev) => (prev ? { ...prev, comments: newComments } : prev));
    setCommentText('');

    const { error } = await supabase.from('videos').update({ comments: newComments }).eq('id', activeVideo.id);
    if (error) console.error('Failed to update comment:', error);
  };

  if (!videos.length) {
    return (
      <div className="min-h-[calc(100vh-4.77rem)] w-full flex flex-col items-center justify-center bg-[#FFF5E6] text-black text-black">
        <h2 className="text-3xl font-extrabold tracking-wide">Looking for videos for you 👀</h2>
        <button
          className="mt-6 bg-yellow-400 px-8 py-3 rounded-full text-black font-semibold shadow-lg hover:scale-105 transition"
          onClick={() => router.push('/uploadVideo')}
        >
          Upload your first video
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-[#FFF5E6] text-black text-black">
      {videos.map((video, index) => (
        <div
          key={video.id || index}
          className="min-h-screen w-full flex items-center justify-center snap-start relative"
        >
          <video
            ref={(el) => { videoRefs.current[index] = el; }}
            src={video.video_url}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            className="h-[65vh] sm:h-[70vh] md:h-[85vh] lg:h-[85vh] w-auto mx-auto rounded-2xl object-contain transition-all duration-300"
            style={{ aspectRatio: '9/16' }}
            onClick={() => {
              const vid = videoRefs.current[index];
              if (!vid) return;
              if (vid.paused) {
                vid.play();
              } else {
                vid.pause();
              }
            }}
          />
          {/* Video control buttons */}
          <div className="absolute bottom-1/2 left-6.5 sm:left-1/6 flex space-x-3">
            {/* Volume toggle button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full bg-[#2A5073] text-white hover:scale-110 transition shadow-lg backdrop-blur-md"
            >
              <img
                src={isMuted ? '/voffic.svg' : '/vonic.svg'}
                alt={isMuted ? 'Volume Off' : 'Volume On'}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
            </button>
          </div>

          {video.description && (
            <div className="absolute top-6 left-1/3 -translate-x-1/2 bg-[#2A5073] border-5 border-[#FFF5E6] text-white text-xs sm:text-sm px-2 py-2 rounded-full max-w-[70%] text-center">
              {video.description}
            </div>
          )}

          {/* Floating action bar */}
          <div className="absolute bottom-24 right-1 sm:right-1/6 flex flex-col items-center space-y-2 text-white scale-90 sm:scale-100">
            {video.owner && (
              <div
                className="flex flex-col items-center mb-2 px-2 py-1 rounded-lg text-xs sm:text-sm"
                onClick={() => router.push(`/uprofiles/${video.user_id}`)}
              >
                {video.owner.profile_image ? (
                  <img
                    src={video.owner.profile_image}
                    alt={`${video.owner.username || 'User'}'s profile`}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-[#FFF5E6] border-2 mb-1"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gray-500 flex items-center justify-center text-xs sm:text-sm">
                    ?
                  </div>
                )}
                <span className="bg-[#FFF5E6] rounded-full px-2 text-black font-medium">
                  {video.owner.username || 'Unknown User'}
                </span>
              </div>
            )}

            {/* Like button */}
            <button
              onClick={() => handleLike(video.id)}
              className={`rounded-full backdrop-blur-md transition transform hover:scale-110 flex flex-col items-center p-2 sm:p-3 ${
                video.liked_by?.includes(userId ?? '')
                  ? 'bg-[#FFD700]'
                  : 'bg-[#2A5073]'
              }`}
            >
              <Heart
                className="w-5 h-5 sm:w-6 sm:h-6 transition-colors"
                stroke={video.liked_by?.includes(userId ?? '') ? '#FFF5E6' : 'white'}
                fill={video.liked_by?.includes(userId ?? '') ? '#FFF5E6' : 'none'}
              />
            </button>
            <span className="bg-[#FFF5E6] rounded-full px-1 text-black text-[10px] -mt-1">
              {video.likes}
            </span>

            {/* Comment button */}
            <button
              onClick={() => openComments(video)}
              className="rounded-full bg-[#2A5073] hover:scale-110 transition flex flex-col items-center p-2 sm:p-3"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <span className="bg-[#FFF5E6] rounded-full px-1 text-black text-[10px] sm:text-xs -mt-1">
              {video.comments.length}
            </span>

            {/* Share button */}
            <button
              onClick={() => handleShare(video.id)}
              className="rounded-full bg-[#2A5073] hover:scale-110 transition flex flex-col items-center p-2 sm:p-3"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <span className="bg-[#FFF5E6] rounded-full px-1 text-black text-[10px] sm:text-xs -mt-1">
              {video.shares}
            </span>
          </div>

        </div>
      ))}

      {/* Upload button */}
      <div className="fixed bottom-24 left-6 sm:left-1/6 z-50">
        <button
          className="flex items-center bg-yellow-400 px-3 py-3 rounded-full text-black font-bold shadow-xl hover:scale-110 transition-transform p-2 sm:p-3"
          onClick={() => router.push('/uploadVideo')}
        >
          <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Comments Drawer */}
      {activeVideo && (
        <div className="bottom-18 fixed inset-0 bg-bg-[#FFF5E6] flex items-end z-50 backdrop-blur-sm">
          <div className="w-full bg-[#b1a085] text-black rounded-t-2xl p-5 max-h-[50vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
              <h3 className="font-bold text-xl">Comments</h3>
              <button onClick={() => setActiveVideo(null)} className="text-gray-200 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {activeVideo.comments?.length ? (
                activeVideo.comments.map((c: Comment, i: number) => (
                  <div key={i} className="p-3 bg-[#FCE9CE] rounded-full shadow">
                    <span className="font-semibold text-yellow-400 text-sm">{c.name || 'Unknown'}: </span>
                    <span>{c.text}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No comments yet.</p>
              )}
            </div>

            <div className="flex space-x-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={submitComment}
                className="bg-yellow-400 px-5 py-2 rounded-lg text-black font-bold hover:scale-105 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-yellow-400 text-black px-6 py-3 rounded-lg shadow-lg animate-fadeInOut font-semibold">
            {t.message}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 2s ease forwards;
        }
      `}</style>
    </div>
  );
}
