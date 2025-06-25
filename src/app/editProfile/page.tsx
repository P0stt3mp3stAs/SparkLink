'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import axios from 'axios';

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

  const isFormValid = country && gender && dob && uploadedImages.length >= 1;

  const user = auth.user?.profile;
  const user_id = user?.sub || '';
  const username = user?.preferred_username || user?.username || '';

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

  const handleSave = () => {
    if (!isFormValid) return;

    sessionStorage.setItem('edit_profile_country', country);
    sessionStorage.setItem('edit_profile_gender', gender);
    sessionStorage.setItem('edit_profile_dob', dob);
    sessionStorage.setItem('edit_profile_images', JSON.stringify(uploadedImages));

    router.push('/profile');
  };

  const handleLog = () => {
    console.log('✅ Full user profile data:', fullProfile);
  };

  const handleSaveToDb = async () => {
    try {
      console.log('🔄 Saving to DB:', fullProfile);
      await axios.put('/api/profile', fullProfile);
      alert('✅ Profile saved to database');
    } catch (err) {
      console.error('❌ Failed to save profile to DB:', err);
      alert('❌ Failed to save to DB. Check console for details.');
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Cognito user info:', {
        user_id,
        username,
        name: user.name,
        email: user.email,
        phone: user.phone_number,
      });
    }
  }, [user]);

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Complete Your Profile</h1>

      {user && (
        <div className="space-y-1 text-sm text-gray-700 bg-gray-100 p-2 rounded">
          <p><strong>User_ID:</strong> {user_id}</p>
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone_number}</p>
        </div>
      )}

      <div>
        <label className="block font-semibold mb-1">Country</label>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full border p-2 rounded"
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
          className="w-full border p-2 rounded"
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
        <p className="text-sm text-gray-500 mt-1">{uploadedImages} image(s) uploaded</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleSave}
          disabled={!isFormValid}
          className={`w-full px-4 py-2 rounded-md font-semibold text-white ${isFormValid ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Save & Go to Profile
        </button>
        <button
          onClick={handleLog}
          className="w-full px-4 py-2 rounded-md font-semibold text-white bg-green-600"
        >
          Console Log
        </button>
        <button
          onClick={handleSaveToDb}
          className="w-full px-4 py-2 rounded-md font-semibold text-white bg-amber-600"
        >
          Save to DB
        </button>
      </div>
    </main>
  );
}