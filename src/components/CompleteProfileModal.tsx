'use client';

import { useEffect, useState } from 'react';

const genderOptions = [
  'Prefer not to say',
  'Male',
  'Female',
  'Nonbinary',
  'Trans male',
  'Trans female',
];

type Props = {
  onSave: (data: {
    age: number;
    country: string;
    gender?: string;
    images: File[];
  }) => void;
};

export default function CompleteProfileModal({ onSave }: Props) {
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isValid, setIsValid] = useState(false);

  // Validate form
  useEffect(() => {
    const isFormValid =
      images.length === 3 &&
      !!age &&
      !!country;
    setIsValid(isFormValid);
  }, [age, country, gender, images]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length <= 3) {
      setImages(Array.from(files));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-black space-y-4">
        <h2 className="text-xl font-semibold">Complete Your Profile</h2>

        {/* Age */}
        <div>
          <label className="block font-medium">Age <span className="text-red-600">*</span></label>
          <input
            type="number"
            min={13}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block font-medium">Country <span className="text-red-600">*</span></label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block font-medium">Gender (optional)</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select</option>
            {genderOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Images */}
        <div>
          <label className="block font-medium">Upload 3 Profile Pictures <span className="text-red-600">*</span></label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          {images.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">{images.length} file(s) selected</p>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={() =>
            onSave({
              age: parseInt(age),
              country,
              gender,
              images,
            })
          }
          disabled={!isValid}
          className={`w-full px-4 py-2 text-white font-medium rounded-md ${
            isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
