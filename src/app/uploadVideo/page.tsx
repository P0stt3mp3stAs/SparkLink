'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from 'react-oidc-context';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UploadVideoPage() {
  const auth = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [description, setDescription] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Debug: Log the auth object to see what's available
  useEffect(() => {
    if (auth.user) {
      console.log('Auth user object:', auth.user);
      console.log('Auth user profile:', auth.user.profile);
      console.log('Auth user profile sub:', auth.user.profile?.sub);

      setDebugInfo(
        JSON.stringify(
          {
            isAuthenticated: auth.isAuthenticated,
            hasUser: !!auth.user,
            profileSub: auth.user.profile?.sub,
            fullProfile: auth.user.profile,
          },
          null,
          2
        )
      );
    }
  }, [auth.user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth.isAuthenticated || !auth.user) {
      setUploadStatus('error');
      setErrorMessage('Please log in to upload videos');
      return;
    }

    const userId = auth.user?.profile?.sub;
    if (!userId) {
      setUploadStatus('error');
      setErrorMessage('Could not determine user ID. Please try logging in again.');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadStatus('error');
      setErrorMessage('Please select a video file');
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setUploadStatus('error');
      setErrorMessage('File size must be less than 100MB');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const filePath = `raw/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('sperly')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: urlData } = supabase.storage.from('sperly').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('videos').insert({
        user_id: userId,
        video_url: urlData.publicUrl,
        description: description.trim() || null, // ✅ save description
        likes: 0,
        shares: 0,
        comments: [],
      });

      if (dbError) {
        throw new Error(dbError.message);
      }

      setUploadStatus('success');
      setDescription(''); // reset description
      e.target.value = ''; // reset file input
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-6">Upload Video</h1>
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6">
            <p className="font-medium">🔒 Authentication Required</p>
            <p className="text-sm">Please log in to upload videos</p>
          </div>
          <button
            onClick={() => auth.signinRedirect()}
            className="bg-yellow-400 px-6 py-3 rounded-xl text-black font-medium hover:bg-yellow-500 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Upload Video</h1>

        {/* Debug info */}
        <div className="text-xs text-gray-500 mb-4 bg-gray-800 p-2 rounded">
          <p>Debug: User ID from auth: {auth.user?.profile?.sub}</p>
          <p>User authenticated: {auth.isAuthenticated ? 'Yes' : 'No'}</p>
        </div>

        {/* ✅ Description input */}
        <div className="mb-6">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a description for your video..."
            className="w-full bg-white/10 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            rows={3}
          />
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-6 hover:border-yellow-400 transition-colors">
          <input
            type="file"
            accept="video/*"
            className="hidden"
            id="videoUpload"
            onChange={handleUpload}
            disabled={uploading || !auth.isAuthenticated}
          />
          <label
            htmlFor="videoUpload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="text-4xl mb-4">📹</div>
            <p className="text-lg font-medium mb-2">
              {uploading ? 'Uploading...' : 'Select video file'}
            </p>
            <p className="text-sm text-gray-400">MP4, MOV, AVI, etc. (Max 100MB)</p>
          </label>
        </div>

        {/* Progress / Status */}
        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">Processing your video...</p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="bg-green-900 text-green-200 p-4 rounded-lg mb-4">
            <p className="font-medium">✅ Upload successful!</p>
            <p className="text-sm">Your video is now being processed.</p>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-4">
            <p className="font-medium">❌ Upload failed</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-8">
          <p>Logged in as: {auth.user?.profile?.sub}</p>
          <p>Videos are uploaded to Supabase Storage and added to your library.</p>
        </div>
      </div>
    </div>
  );
}
