//src/components/ProfileImageUploader.tsx
'use client';

import { useState } from 'react';

export default function ProfileImageUploader({
  onUploaded,
}: {
  onUploaded?: (url: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setUploading(true);

    try {
      const res = await fetch(`/api/upload-url?fileName=${file.name}&fileType=${file.type}`);
      const data = await res.json();

      const uploadRes = await fetch(data.url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (uploadRes.ok) {
        alert('Upload complete!');
        const cleanUrl = data.url.split('?')[0];
if (onUploaded) onUploaded(cleanUrl);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('An error occurred during upload.');
    }

    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
