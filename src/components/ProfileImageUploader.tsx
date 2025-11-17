'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react';

export default function ProfileImageUploader({
  onUploaded,
}: {
  onUploaded?: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET!;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      if (onUploaded) onUploaded(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      alert('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <label
      className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition 
      ${uploading ? 'opacity-60' : 'hover:opacity-80'} bg-[#2A5073] text-white`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      {uploading ? (
        <span className="text-sm animate-pulse">...</span>
      ) : (
        <Plus size={24} strokeWidth={2.5} />
      )}
    </label>
  );
}
