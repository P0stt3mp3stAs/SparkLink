'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import axios from 'axios';
import { X } from 'lucide-react';

const genderOptions = [
  'Male',
  'Female',
  'Non-binary',
  'Transmale',
  'Transfemale',
  'Prefer not to say'
];

export default function EditProfilePage() {
  const router = useRouter();
  const auth = useAuth();

  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showSparkles, setShowSparkles] = useState(false);

  const isFormValid = country && gender && dob && uploadedImages.length >= 1;

  const user = auth.user?.profile;
  const user_id = user?.sub || '';
  const username = user?.preferred_username || user?.username || '';

  useEffect(() => {
    if (auth.isAuthenticated && user) {
      const fetchProfile = async () => {
        try {
          const res = await axios.get(`/api/profile?user_id=${user_id}`);
          const profile = res.data as {
            country?: string;
            gender?: string;
            date_of_birth?: string;
            images?: string[];
          };
          if (profile.country) setCountry(profile.country);
          if (profile.gender) setGender(profile.gender);
          if (profile.date_of_birth) setDob(profile.date_of_birth.slice(0, 10));
          if (profile.images) setUploadedImages(profile.images);
        } catch {}
      };
      fetchProfile();
    }
  }, [auth.isAuthenticated, user]);

  const handleSaveToDb = async () => {
    try {
      const fullProfile = {
        user_id,
        username,
        name: user?.name,
        email: user?.email,
        phone: user?.phone_number,
        country,
        gender,
        date_of_birth: dob,
        images: uploadedImages
      };
      await axios.put('/api/profile', fullProfile);

      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1200);
    } catch {}
  };

  const handleRemoveImage = (imgUrl: string) => {
    if (!confirm("Do you want to remove this image?")) return;
    setUploadedImages((prev) => prev.filter((img) => img !== imgUrl));
  };

  // Create multiple random sparkles
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 80 - 20}%`,
    left: `${Math.random() * 100}%`,
    rotate: `${Math.random() * 360}deg`,
    translateX: `${Math.random() * 30 - 15}px`,
    translateY: `${Math.random() * 30 - 15}px`,
    scale: 0.8 + Math.random() * 0.6
  }));

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Complete Your Profile</h1>

      <div>
        <label className="block font-semibold mb-1">Country</label>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border p-2 rounded-full"
          placeholder="Enter your country"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full border p-2 rounded-full"
        >
          <option value="">Select gender</option>
          {genderOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">Date of Birth</label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full border p-2 rounded-full"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Upload 1–3 Images</label>
        <ProfileImageUploader onUploaded={(url) => {
          setUploadedImages((prev) => {
            const next = [...prev, url];
            return next.slice(0, 3);
          });
        }} />

        {uploadedImages.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative w-16 h-16">
                <img
                  src={img}
                  alt={`Profile ${idx}`}
                  className="w-16 h-16 object-cover rounded-full"
                />
                <button
                  onClick={() => handleRemoveImage(img)}
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-1">
          {uploadedImages.length} image(s) uploaded
        </p>
      </div>

      <div className="flex flex-col gap-2 relative overflow-visible">
        <div className="relative">
          <button
            onClick={handleSaveToDb}
            disabled={!isFormValid}
            className={`w-full px-4 py-2 rounded-full font-semibold text-white 
              ${isFormValid 
                ? 'bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200' 
                : 'bg-gray-600 cursor-not-allowed'
              }`}
          >
            Save
          </button>

          {showSparkles && sparkles.map(s => (
            <span
              key={s.id}
              className="sparkle"
              style={{
                top: s.top,
                left: s.left,
                transform: `rotate(${s.rotate})`,
                '--translate-x': s.translateX,
                '--translate-y': s.translateY,
                '--scale': s.scale
              } as React.CSSProperties}
            >
              ✦
            </span>
          ))}
        </div>

        <button
          onClick={() => router.push('/profile')}
          className="w-full px-4 py-2 rounded-full font-semibold text-white bg-blue-500 hover:bg-blue-400 transition-colors duration-200"
        >
          Go to Profile
        </button>
      </div>

      <style jsx>{`
        .sparkle {
          position: absolute;
          font-size: 1.2rem;
          color: #facc15; /* yellow-400 */
          animation: sparkleFly 0.8s forwards;
          pointer-events: none;
        }
        @keyframes sparkleFly {
          0% { opacity: 1; transform: scale(1) translate(0,0) rotate(0); }
          100% { 
            opacity: 0; 
            transform: 
              scale(var(--scale)) 
              translate(var(--translate-x), var(--translate-y))
              rotate(45deg);
          }
        }
      `}</style>
    </main>
  );
}
