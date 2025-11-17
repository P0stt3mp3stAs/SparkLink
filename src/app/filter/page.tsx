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
    <div className="min-h-[calc(100vh-4.77rem)] flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-gradient-to-b from-[#FCE9CE] to-[#FFF5E6] rounded-xl p-4 space-y-4">
        <h1 className="text-xl font-bold text-center text-yellow-400">
          ✨ Filters
        </h1>

        {/* Age slider */}
        <div>
          <label className="block font-medium mb-1 text-black text-sm">
            Age or less: <span className="text-yellow-400">{age}</span>
          </label>
          <input
            type="range"
            min={1}
            max={200}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full appearance-none bg-neutral-700 h-1.5 rounded-lg cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400
                      [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 
                      [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-yellow-400"
          />
        </div>

        {/* Gender select */}
        <div>
          <label className="block font-medium mb-1 text-black text-sm">Gender</label>
          <div className="relative">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full appearance-none px-2 py-1.5 rounded-full bg-[#F5DCB9]
                        text-black text-xs font-medium focus:ring-1 focus:ring-white 
                        focus:border-white transition cursor-pointer"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Transmale">Transmale</option>
              <option value="Transfemale">Transfemale</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black text-xs">
              ▼
            </span>
          </div>
        </div>

        {/* Sexuality select */}
        <div>
          <label className="block font-medium mb-1 text-black text-sm">Sexuality</label>
          <div className="relative">
            <select
              value={sexuality}
              onChange={(e) => setSexuality(e.target.value)}
              className="w-full appearance-none px-2 py-1.5 rounded-full bg-[#F5DCB9]
                        text-black text-xs font-medium focus:ring-1 focus:ring-white 
                        focus:border-white transition cursor-pointer"
            >
              <option value="">Select</option>
              <option value="Straight">Straight</option>
              <option value="Gay">Gay</option>
              <option value="Bisexual">Bisexual</option>
              <option value="Other">Other</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black text-xs">
              ▼
            </span>
          </div>
        </div>

        {/* Looking For */}
        <div>
          <h2 className="text-sm font-semibold mb-1 text-black">Looking For</h2>
          <div className="flex flex-wrap gap-1">
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
                <span className="px-2 py-0.5 text-xs rounded-full bg-[#F5DCB9] text-black 
                                 hover:bg-[#E6C494] transition peer-checked:bg-yellow-400 
                                 peer-checked:text-black font-medium">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Max Height */}
        <div>
          <label className="block font-medium mb-1 text-black text-sm">
            Height or less: <span className="text-yellow-400">{height} cm</span>
          </label>
          <input
            type="range"
            min={100}
            max={220}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer h-1.5"
          />
        </div>

        {/* Max Weight */}
        <div>
          <label className="block font-medium mb-1 text-black text-sm">
            Weight or less: <span className="text-yellow-400">{weight} kg</span>
          </label>
          <input
            type="range"
            min={30}
            max={150}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer h-1.5"
          />
        </div>

        {/* Submit */}
        <button 
          onClick={handleApplyFilters}
          className="w-full py-2 bg-yellow-400 text-black text-sm rounded-lg font-bold 
                     hover:bg-yellow-500 transition transform hover:scale-[1.02] shadow"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}