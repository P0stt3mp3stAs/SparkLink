'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';
import cities from 'cities.json';
import countries from 'world-countries';

// Type for city data
interface City {
  country: string;
  name: string;
  lat: string;
  lng: string;
}

// Type for country data
interface Country {
  cca2: string;
  name: {
    common: string;
  };
  flag: string;
}

// Type for user details from API
interface UserDetails {
  user_id: string;
  height_cm: number;
  weight_kg: number;
  location: string;
  sexuality: string;
  looking_for: string;
}

export default function DetailsForm() {
  const router = useRouter();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    height_cm: '',
    weight_kg: '',
    country: '',
    city: '',
    sexuality: '',
    looking_for: ''
  });

  const [allCountries, setAllCountries] = useState<Array<{code: string; name: string; flag: string}>>([]);
  const [filteredCountries, setFilteredCountries] = useState<Array<{code: string; name: string; flag: string}>>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize countries and fetch existing user details
  useEffect(() => {
    const initializeData = async () => {
      const formatted = (countries as unknown as Country[])
        .map(country => ({
          code: country.cca2,
          name: country.name.common,
          flag: country.flag
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setAllCountries(formatted);
      setFilteredCountries(formatted);

      if (auth.user?.profile?.sub) {
        try {
          const response = await axios.get<UserDetails>(`/api/user-details?user_id=${auth.user.profile.sub}`);
          const userDetails: UserDetails = response.data;
          
          let countryCode = '';
          let cityName = '';
          
          if (userDetails.location) {
            const locationParts = userDetails.location.split('-');
            if (locationParts.length === 2) {
              cityName = locationParts[0];
              const countryName = locationParts[1];
              const country = formatted.find(c => 
                c.name.toLowerCase() === countryName.toLowerCase()
              );
              if (country) countryCode = country.code;
            } else if (locationParts.length === 1) {
              const countryName = locationParts[0];
              const country = formatted.find(c => 
                c.name.toLowerCase() === countryName.toLowerCase()
              );
              if (country) countryCode = country.code;
            }
          }

          setFormData({
            height_cm: userDetails.height_cm?.toString() || '',
            weight_kg: userDetails.weight_kg?.toString() || '',
            country: countryCode,
            city: cityName,
            sexuality: userDetails.sexuality || '',
            looking_for: userDetails.looking_for || ''
          });

          if (cityName) setCitySearch(cityName);
          if (countryCode) {
            const country = formatted.find(c => c.code === countryCode);
            if (country) setCountrySearch(country.name);
          }
        } catch (error) {
          console.error('Fetch error:', error);
        }
      }
      
      setIsLoading(false);
    };

    initializeData();
  }, [auth.user]);

  useEffect(() => {
    if (countrySearch.trim()) {
      const searchTerm = countrySearch.toLowerCase().trim();
      setFilteredCountries(
        allCountries.filter(country =>
          country.name.toLowerCase().includes(searchTerm) ||
          country.code.toLowerCase().includes(searchTerm)
        )
      );
    } else setFilteredCountries(allCountries);
  }, [countrySearch, allCountries]);

  useEffect(() => {
    if (formData.country) {
      let countryCities = (cities as City[]).filter(city => 
        city.country === formData.country
      );
      if (citySearch.trim()) {
        const searchTerm = citySearch.toLowerCase().trim();
        countryCities = countryCities.filter(city =>
          city.name.toLowerCase().includes(searchTerm)
        );
      }
      setFilteredCities(countryCities.sort((a, b) => a.name.localeCompare(b.name)));
    } else setFilteredCities([]);
  }, [formData.country, citySearch]);

  const getCountryName = (code: string) => {
    const country = allCountries.find(c => c.code === code);
    return country ? country.name : code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const countryName = getCountryName(formData.country);
      await axios.post('/api/user-details', {
        user_id: auth.user?.profile?.sub,
        height_cm: parseInt(formData.height_cm),
        weight_kg: parseInt(formData.weight_kg),
        location: formData.city ? `${formData.city}-${countryName}` : countryName,
        sexuality: formData.sexuality,
        looking_for: formData.looking_for
      });
      router.push('/glide');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCountryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setCountrySearch(e.target.value);
  const handleCountrySelect = (code: string, name: string) => {
    setFormData({...formData, country: code, city: ''});
    setCountrySearch(name);
    setShowCountryDropdown(false);
    setCitySearch('');
  };
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCitySearch(value);
    setFormData({...formData, city: value});
  };
  const handleCitySelect = (name: string) => {
    setFormData({...formData, city: name});
    setCitySearch(name);
    setShowCityDropdown(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5E6] text-black px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-10">
        {formData.country ? 'Edit Your Profile' : 'Complete Your Profile'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto bg-white/70 backdrop-blur-sm rounded-3xl shadow-md p-6"
      >
        {/* Height */}
        <div>
          <label className="block mb-1 font-medium">
            Height (cm) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            value={formData.height_cm}
            onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
            className="w-full p-2 rounded-full bg-[#FCE9CE]"
            required
            min="100"
            max="250"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block mb-1 font-medium">
            Weight (kg) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            value={formData.weight_kg}
            onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
            className="w-full p-2 rounded-full bg-[#FCE9CE]"
            required
            min="30"
            max="200"
          />
        </div>

        {/* Country */}
        <div className="sm:col-span-2">
          <label className="block mb-1 font-medium">
            Country <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={countrySearch}
              onChange={handleCountryInputChange}
              onFocus={() => setShowCountryDropdown(true)}
              onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
              placeholder="Search for a country..."
              className="w-full p-2 rounded-full bg-[#FCE9CE]"
              required
            />
            {showCountryDropdown && (
              <div className="absolute z-20 w-full max-h-48 overflow-y-auto rounded bg-[#fad9ab] mt-1 shadow-md">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <div
                      key={country.code}
                      className="p-2 hover:bg-[#FFF5E6] cursor-pointer"
                      onClick={() => handleCountrySelect(country.code, country.name)}
                    >
                      {country.flag} {country.name}
                    </div>
                  ))
                ) : (
                  <p className="p-2 text-gray-700">No countries found</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* City */}
        <div className="sm:col-span-2">
          <label className="block mb-1 font-medium">
            City <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={citySearch}
              onChange={handleCityInputChange}
              onFocus={() => setShowCityDropdown(true)}
              onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
              placeholder={formData.country ? "Search for a city..." : "First select a country"}
              className="w-full p-2 rounded-full bg-[#FCE9CE]"
              required
              disabled={!formData.country}
            />
            {showCityDropdown && formData.country && (
              <div className="absolute z-10 w-full max-h-48 overflow-y-auto bg-[#fad9ab] mt-1 rounded shadow-md">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <div
                      key={`${city.name}-${city.lat}-${city.lng}`}
                      className="p-2 hover:bg-[#FFF5E6] cursor-pointer"
                      onClick={() => handleCitySelect(city.name)}
                    >
                      {city.name}
                    </div>
                  ))
                ) : (
                  <p className="p-2 text-gray-700">No cities found</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sexuality */}
        <div>
          <label className="block mb-1 font-medium">
            Sexuality <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.sexuality}
            onChange={(e) => setFormData({...formData, sexuality: e.target.value})}
            className="w-full p-2 rounded-full bg-[#FCE9CE]"
            required
          >
            <option value="">Select</option>
            <option value="straight">Straight</option>
            <option value="gay">Gay</option>
            <option value="bisexual">Bisexual</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Looking For */}
        <div>
          <label className="block mb-1 font-medium">
            Looking For <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.looking_for}
            onChange={(e) => setFormData({...formData, looking_for: e.target.value})}
            className="w-full p-2 rounded-full bg-[#FCE9CE]"
            required
          >
            <option value="">Select</option>
            <option value="friendship">Friendship</option>
            <option value="relationship">Relationship</option>
            <option value="something casual">Something Casual</option>
            <option value="one night stand">One Night Stand</option>
          </select>
        </div>

        {/* Submit */}
        <div className="sm:col-span-2 flex justify-center -translate-y-10 sm:-translate-y-0">
          <button
            type="submit"
            className="w-full sm:w-1/2 py-2 bg-[#FFD700] text-black rounded-full font-bold hover:bg-[#ffdd1e] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!formData.city || !formData.country}
          >
            {formData.country ? 'Update Details' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
