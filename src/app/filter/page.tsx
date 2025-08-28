// app/filter/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FilterPage() {
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState('');
  const [sexuality, setSexuality] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const router = useRouter();

  const handleApplyFilters = () => {
    // Create a query string with all filter parameters
    const queryParams = new URLSearchParams({
      age: age.toString(),
      gender,
      sexuality,
      lookingFor,
      height: height.toString(),
      weight: weight.toString()
    }).toString();

    // Redirect to glide page with query parameters
    router.push(`/glide?${queryParams}`);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-neutral-900 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 border border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-yellow-400">
          ✨ Filters
        </h1>

        {/* Age slider */}
        <div>
          <label className="block font-medium mb-2 sm:mb-3 text-white">
            Age or less: <span className="text-yellow-400">{age}</span>
          </label>
          <input
            type="range"
            min={1}
            max={200}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full appearance-none bg-neutral-700 h-2 rounded-lg cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400
                      [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                      [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-yellow-400"
          />
        </div>

        {/* Gender select */}
        <div>
          <label className="block font-medium mb-2 sm:mb-3 text-white">Gender</label>
          <div className="relative">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full appearance-none px-3 py-2 sm:p-3 rounded-full bg-neutral-900 border border-neutral-700 
                        text-white text-sm sm:text-base font-medium focus:ring-2 focus:ring-yellow-400 
                        focus:border-yellow-400 transition cursor-pointer"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Transmale">Transmale</option>
              <option value="Transfemale">Transfemale</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <span className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-yellow-400">
              ▼
            </span>
          </div>
        </div>

        {/* Sexuality select */}
        <div>
          <label className="block font-medium mb-2 sm:mb-3 text-white">Sexuality</label>
          <div className="relative">
            <select
              value={sexuality}
              onChange={(e) => setSexuality(e.target.value)}
              className="w-full appearance-none px-3 py-2 sm:p-3 rounded-full bg-neutral-900 border border-neutral-700 
                        text-white text-sm sm:text-base font-medium focus:ring-2 focus:ring-yellow-400 
                        focus:border-yellow-400 transition cursor-pointer"
            >
              <option value="">Select</option>
              <option value="Straight">Straight</option>
              <option value="Gay">Gay</option>
              <option value="Bisexual">Bisexual</option>
              <option value="Other">Other</option>
            </select>
            <span className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-yellow-400">
              ▼
            </span>
          </div>
        </div>

        {/* Looking For */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Looking For</h2>
          <div className="flex flex-wrap gap-2">
            {['Friendship', 'Relationship', 'Something Casual', 'One Night Stand'].map((option) => (
              <label key={option} className="cursor-pointer">
                <input
                  type="radio"
                  name="lookingFor"
                  value={option}
                  checked={lookingFor === option}
                  onChange={(e) => setLookingFor(e.target.value)}
                  className="hidden peer"
                />
                <span className="px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm md:px-5 md:py-2 md:text-base 
                                 rounded-full border border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700 
                                 transition peer-checked:bg-yellow-400 peer-checked:text-black font-medium">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Max Height */}
        <div>
          <label className="block font-medium mb-2 sm:mb-3 text-white">
            Height or less: <span className="text-yellow-400">{height} cm</span>
          </label>
          <input
            type="range"
            min={100}
            max={220}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer"
          />
        </div>

        {/* Max Weight */}
        <div>
          <label className="block font-medium mb-2 sm:mb-3 text-white">
            Weight or less: <span className="text-yellow-400">{weight} kg</span>
          </label>
          <input
            type="range"
            min={30}
            max={150}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer"
          />
        </div>

        {/* Submit */}
        <button 
          onClick={handleApplyFilters}
          className="w-full py-3 sm:py-4 bg-yellow-400 text-black text-base sm:text-lg rounded-xl font-bold 
                     hover:bg-yellow-500 transition transform hover:scale-[1.02] shadow-lg"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}