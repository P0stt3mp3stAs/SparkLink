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

export default function FadePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const router = useRouter();
  const auth = useAuth();
  const userId = auth.user?.profile?.sub;

  const showToast = (message: string) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2000);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // 🔍 API call to get profile data for a user
  const fetchUserProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/search-user?user_id=${userId}`);
      if (!res.ok) {
        console.error(`❌ Error fetching profile for user ${userId}:`, await res.json());
        return null;
      }
      const userData = await res.json();
      return userData;
    } catch (err) {
      console.error("🔥 Failed to fetch profile:", err);
      return null;
    }
  };

  // 🎥 Fetch videos + enrich with owner profile
  const fetchVideos = async () => {
    const { data: videosData, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      return;
    }

    if (videosData) {
      const videosWithProfiles = await Promise.all(
        videosData.map(async (video) => {
          const profile = await fetchUserProfile(video.user_id);
          return { ...video, owner: profile };
        })
      );

      setVideos(videosWithProfiles);
    }
  };

  const handleLike = async (videoId: string) => {
    if (!userId) return showToast('You must be logged in to like.');

    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    const likedBy: string[] = video.liked_by || [];
    let newLikes = video.likes;
    let updatedLikedBy: string[];

    if (likedBy.includes(userId)) {
      updatedLikedBy = likedBy.filter((id: string) => id !== userId);
      newLikes = Math.max(video.likes - 1, 0);
    } else {
      updatedLikedBy = [...likedBy, userId];
      newLikes = video.likes + 1;
    }

    setVideos(videos.map(v => v.id === videoId ? { ...v, likes: newLikes, liked_by: updatedLikedBy } : v));

    const { error } = await supabase
      .from('videos')
      .update({ likes: newLikes, liked_by: updatedLikedBy })
      .eq('id', videoId);

    if (error) console.error('Failed to update like:', error);
  };

  const handleShare = async (videoId: string) => {
    if (!userId) return showToast('You must be logged in to share.');

    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    const sharedBy: string[] = video.shared_by || [];
    let updatedSharedBy = sharedBy;
    let updatedShares = video.shares || 0;

    navigator.clipboard.writeText(video.video_url)
      .then(() => showToast('Video link copied!'))
      .catch(() => showToast('Failed to copy link.'));

    if (!sharedBy.includes(userId)) {
      updatedSharedBy = [...sharedBy, userId];
      updatedShares = updatedSharedBy.length;

      setVideos(videos.map(v =>
        v.id === videoId ? { ...v, shares: updatedShares, shared_by: updatedSharedBy } : v
      ));

      const { error } = await supabase
        .from('videos')
        .update({ shares: updatedShares, shared_by: updatedSharedBy })
        .eq('id', videoId);

      if (error) console.error('Failed to update share:', error);
    }
  };

  const openComments = (video: any) => {
    setActiveVideo(video);
    setCommentText('');
  };

  const submitComment = async () => {
    if (!userId) return showToast('You must be logged in to comment.');
    if (!commentText.trim()) return;

    const video = activeVideo;
    const newComments = [...(video.comments || []), { user: userId, text: commentText.trim() }];

    setVideos(videos.map(v => v.id === video.id ? { ...v, comments: newComments } : v));
    setActiveVideo({ ...video, comments: newComments });
    setCommentText('');

    const { error } = await supabase
      .from('videos')
      .update({ comments: newComments })
      .eq('id', video.id);

    if (error) console.error('Failed to update comment:', error);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [videos]);

  if (!videos.length) {
    return (
      <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center bg-gradient-to-b from-black to-blue-950 text-white">
        <h2 className="text-3xl font-extrabold tracking-wide">No videos yet 👀</h2>
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
    <div className="min-h-[calc(100vh-80px)] w-full overflow-y-scroll snap-y snap-mandatory bg-gradient-to-b from-black via-blue-950 to-black text-white">
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center snap-start relative"
        >
          <video
            ref={(el) => { videoRefs.current[index] = el; }}
            src={video.video_url}
            autoPlay
            loop
            muted
            playsInline
            className="h-[85vh] w-auto mx-auto rounded-2xl object-cover shadow-2xl border border-white/10"
            style={{ aspectRatio: '9/16' }}
          />

          {/* ✅ Video description */}
          {video.description && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full max-w-[70%] text-center">
              {video.description}
            </div>
          )}

          {/* Floating action bar */}
        <div className="absolute bottom-24 right-6 flex flex-col items-center space-y-2 text-white">
          {/* 👤 Owner profile above like button */}
          {video.owner && (
            <div className="flex flex-col items-center mb-2 px-3 py-1 rounded-lg text-sm">
              {video.owner.profile_image ? (
                <img
                  src={video.owner.profile_image}
                  alt={`${video.owner.username || 'User'}'s profile`}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full object-cover border border-white/20 mb-1"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-gray-500 flex items-center justify-center text-xs sm:text-sm md:text-base text-white mb-1">
                  ?
                </div>
              )}
              <span className="font-medium">{video.owner.username || 'Unknown User'}</span>
            </div>
          )}

          {/* Like button */}
          <button
            onClick={() => handleLike(video.id)}
            className={`rounded-full shadow-xl backdrop-blur-md transition transform hover:scale-110 flex flex-col items-center p-3 sm:p-4 md:p-5 ${
              video.liked_by?.includes(userId) ? 'bg-yellow-400 text-black' : 'bg-white/20'
            }`}
          >
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill={video.liked_by?.includes(userId) ? 'black' : 'none'} />
          </button>
          <span className="text-xs sm:text-sm md:text-base -mt-1">{video.likes}</span>

          {/* Comments button */}
          <button
            onClick={() => openComments(video)}
            className="rounded-full shadow-xl bg-white/20 hover:scale-110 transition flex flex-col items-center p-3 sm:p-4 md:p-5"
          >
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </button>
          <span className="text-xs sm:text-sm md:text-base -mt-1">{video.comments.length}</span>

          {/* Share button */}
          <button
            onClick={() => handleShare(video.id)}
            className="rounded-full shadow-xl bg-white/20 hover:scale-110 transition flex flex-col items-center p-3 sm:p-4 md:p-5"
          >
            <Share2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </button>
          <span className="text-xs sm:text-sm md:text-base -mt-1">{video.shares}</span>
        </div>

        </div>
      ))}
      {/* Upload button */}
      <div className="fixed bottom-24 left-6 z-50">
        <button
          className="flex items-center bg-yellow-400 px-3 py-3 rounded-full text-black font-bold shadow-xl hover:scale-110 transition"
          onClick={() => router.push('/uploadVideo')}
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Drawer */}
      {activeVideo && (
        <div className="bottom-18 fixed inset-0 bg-black/70 flex items-end z-50 backdrop-blur-sm">
          <div className="w-full bg-gradient-to-b from-gray-900 to-black text-white rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
              <h3 className="font-bold text-xl">Comments</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {activeVideo.comments?.length ? (
                activeVideo.comments.map((c: any, i: number) => (
                  <div key={i} className="p-3 bg-white/10 rounded-lg shadow">
                    <span className="font-semibold text-yellow-400 text-sm">{c.user}: </span>
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
          <div
            key={t.id}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg shadow-lg animate-fadeInOut font-semibold"
          >
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
