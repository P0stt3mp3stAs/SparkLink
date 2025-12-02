'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import axios from 'axios';
import { X, Edit } from 'lucide-react';

const genderOptions = [
  'Male',
  'Female',
  'Non-binary',
  'Transmale',
  'Transfemale',
  'Prefer not to say'
];

type Profile = {
  country?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  images?: string[] | null;
};

export default function EditProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const user = auth.user?.profile;
  const user_id = user?.sub || '';

  const isFormValid = country && gender && dob && uploadedImages.length >= 1;

  useEffect(() => {
    if (auth.isLoading) return;

    if (!auth.user) {
      router.push('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get<Profile>(`/api/profile?user_id=${user_id}`);
        const p = res.data;

        setCountry(p?.country ?? '');
        setGender(p?.gender ?? '');
        setDob(p?.date_of_birth?.slice(0, 10) ?? '');
        setUploadedImages(p?.images ?? []);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth.isLoading, auth.user, user_id, router]);

  const handleSaveToDb = async () => {
    try {
      const fullProfile = {
        user_id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone_number,
        country,
        gender,
        date_of_birth: dob,
        images: uploadedImages
      };

      await axios.put('/api/profile', fullProfile);
      router.push('/profile');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleEditDetails = () => router.push('/details-form');

  const handleRemoveImage = (imgUrl: string) => {
    if (!confirm('Do you want to remove this image?')) return;
    setUploadedImages(prev => prev.filter(img => img !== imgUrl));
  };

  const handleSignOut = () => {
    auth.removeUser();
    auth.clearStaleState();
    router.push('/');
  };
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FFF5E6]">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-lg text-black font-medium">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4.77rem)] flex items-center justify-center bg-[#FFF5E6] text-black p-6">
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/70 backdrop-blur-sm rounded-3xl shadow-md p-8 text-center sm:text-left">

        <h1 className="col-span-full text-2xl font-bold text-center mb-2">
          Complete Your Profile
        </h1>

        <button
          onClick={handleEditDetails}
          className="p-3 rounded-full bg-[#2A5073] text-white hover:bg-[#244665] transition flex items-center justify-center gap-2"
        >
          <Edit size={20} />
          <span className="text-sm font-medium">Fill in extra profile details</span>
        </button>

        <div>
          <label className="block font-semibold mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-[#FCE9CE] p-2 rounded-full text-center sm:text-left"
            placeholder="Enter your country"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-[#FCE9CE] p-2 rounded-full text-center sm:text-left"
          >
            <option value="">Select gender</option>
            {genderOptions.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full bg-[#FCE9CE] p-2 rounded-full text-center sm:text-left"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">
            Upload 1–3 Images <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-2 mt-2 flex-wrap justify-center sm:justify-start items-center">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative w-16 h-16">
                <img
                  src={img}
                  loading="lazy"
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

            {uploadedImages.length < 3 && (
              <ProfileImageUploader
                onUploaded={(url) =>
                  setUploadedImages(prev => [...prev, url].slice(0, 3))
                }
              />
            )}
          </div>

          <p className="text-sm text-gray-500 mt-1 text-center sm:text-left">
            {uploadedImages.length} image(s) uploaded
          </p>
        </div>

        <div className="col-span-full flex flex-col items-center">
          <button
            onClick={handleSaveToDb}
            disabled={!isFormValid}
            className={`px-8 py-3 rounded-full font-semibold text-white text-lg
              ${isFormValid
                ? 'bg-[#FFD700] hover:bg-yellow-400'
                : 'bg-gray-600 cursor-not-allowed'
              }`}
          >
            Save & Go
          </button>

          <button
            onClick={handleSignOut}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>

      </div>
    </main>
  );
}
