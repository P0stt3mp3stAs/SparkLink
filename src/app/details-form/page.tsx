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
      // Initialize countries
      const formatted = (countries as unknown as Country[])
        .map(country => ({
          code: country.cca2,
          name: country.name.common,
          flag: country.flag
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setAllCountries(formatted);
      setFilteredCountries(formatted);

      // Fetch existing user details if available
      if (auth.user?.profile?.sub) {
        try {
          const response = await axios.get<UserDetails>(`/api/user-details?user_id=${auth.user.profile.sub}`);
          const userDetails: UserDetails = response.data;
          
          // Parse location (format: "City-Country" or just "Country")
          let countryCode = '';
          let cityName = '';
          
          if (userDetails.location) {
            const locationParts = userDetails.location.split('-');
            if (locationParts.length === 2) {
              cityName = locationParts[0];
              const countryName = locationParts[1];
              
              // Find country code from country name
              const country = formatted.find(c => 
                c.name.toLowerCase() === countryName.toLowerCase()
              );
              if (country) {
                countryCode = country.code;
              }
            } else if (locationParts.length === 1) {
              // Only country provided
              const countryName = locationParts[0];
              const country = formatted.find(c => 
                c.name.toLowerCase() === countryName.toLowerCase()
              );
              if (country) {
                countryCode = country.code;
                setCountrySearch(country.name);
              }
            }
          }

          // Pre-fill form with existing data
          setFormData({
            height_cm: userDetails.height_cm?.toString() || '',
            weight_kg: userDetails.weight_kg?.toString() || '',
            country: countryCode,
            city: cityName,
            sexuality: userDetails.sexuality || '',
            looking_for: userDetails.looking_for || ''
          });

          // Set search values for display
          if (cityName) {
            setCitySearch(cityName);
          }
          if (countryCode) {
            const country = formatted.find(c => c.code === countryCode);
            if (country) {
              setCountrySearch(country.name);
            }
          }

        } catch (error: unknown) {
          if (
            typeof error === 'object' &&
            error !== null &&
            'response' in error &&
            typeof (error as { response?: { status?: number } }).response?.status === 'number' &&
            (error as { response?: { status?: number } }).response?.status !== 404
          ) {
            console.error('Failed to fetch user details:', error);
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeData();
  }, [auth.user]);

  // Filter countries based on search input
  useEffect(() => {
    if (countrySearch.trim()) {
      const searchTerm = countrySearch.toLowerCase().trim();
      const filtered = allCountries.filter(country =>
        country.name.toLowerCase().includes(searchTerm) ||
        country.code.toLowerCase().includes(searchTerm)
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(allCountries);
    }
  }, [countrySearch, allCountries]);

  // Filter cities based on selected country code AND search input
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
    } else {
      setFilteredCities([]);
    }
  }, [formData.country, citySearch]);

  // Get full country name from code
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

  const handleCountryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountrySearch(value);
  };

  const handleCountrySelect = (countryCode: string, countryName: string) => {
    setFormData({...formData, country: countryCode, city: ''});
    setCountrySearch(countryName);
    setShowCountryDropdown(false);
    setCitySearch(''); // Reset city search
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCitySearch(value);
    setFormData({...formData, city: value});
  };

  const handleCitySelect = (cityName: string) => {
    setFormData({...formData, city: cityName});
    setCitySearch(cityName);
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
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-6">
        {formData.country ? 'Edit Your Profile' : 'Complete Your Profile'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        {/* Height and Weight inputs */}
        <div>
          <label className="block mb-1">Height (cm)</label>
          <input
            type="number"
            value={formData.height_cm}
            onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
            min="100"
            max="250"
          />
        </div>
        
        <div>
          <label className="block mb-1">Weight (kg)</label>
          <input
            type="number"
            value={formData.weight_kg}
            onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
            min="30"
            max="200"
          />
        </div>

        {/* Country Select with Search */}
        <div>
          <label className="block mb-1">Country</label>
          <div className="relative">
            <input
              type="text"
              value={countrySearch}
              onChange={handleCountryInputChange}
              onFocus={() => setShowCountryDropdown(true)}
              onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
              placeholder="Search for a country..."
              className="w-full p-2 rounded bg-gray-800 text-white"
              required
            />
            {showCountryDropdown && filteredCountries.length > 0 && (
              <div className="absolute z-20 w-full max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded mt-1">
                {filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    className="p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleCountrySelect(country.code, country.name)}
                  >
                    {country.flag} {country.name}
                  </div>
                ))}
              </div>
            )}
            {showCountryDropdown && filteredCountries.length === 0 && countrySearch.trim() && (
              <div className="absolute z-20 w-full bg-gray-800 border border-gray-700 rounded mt-1 p-2">
                <p className="text-gray-400">No countries found matching &quot;{countrySearch}&quot</p>
              </div>
            )}
          </div>
        </div>

        {/* City Select with Search */}
        <div>
          <label className="block mb-1">City</label>
          <div className="relative">
            <input
              type="text"
              value={citySearch}
              onChange={handleCityInputChange}
              onFocus={() => setShowCityDropdown(true)}
              onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
              placeholder={formData.country ? "Search for a city..." : "First select a country"}
              className="w-full p-2 rounded bg-gray-800 text-white"
              required
              disabled={!formData.country}
            />
            {showCityDropdown && formData.country && filteredCities.length > 0 && (
              <div className="absolute z-10 w-full max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded mt-1">
                {filteredCities.map((city) => (
                  <div
                    key={`${city.name}-${city.lat}-${city.lng}`}
                    className="p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleCitySelect(city.name)}
                  >
                    {city.name}
                  </div>
                ))}
              </div>
            )}
            {showCityDropdown && formData.country && filteredCities.length === 0 && citySearch.trim() && (
              <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded mt-1 p-2">
                <p className="text-gray-400">No cities found matching &quot{citySearch}&quot</p>
              </div>
            )}
          </div>
          {formData.country && filteredCities.length === 0 && !citySearch.trim() && (
            <p className="text-sm text-gray-400 mt-1">No cities found for this country</p>
          )}
        </div>

        {/* Sexuality and Looking For selects */}
        <div>
          <label className="block mb-1">Sexuality</label>
          <select
            value={formData.sexuality}
            onChange={(e) => setFormData({...formData, sexuality: e.target.value})}
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
          >
            <option value="">Select</option>
            <option value="straight">Straight</option>
            <option value="gay">Gay</option>
            <option value="bisexual">Bisexual</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Looking For</label>
          <select
            value={formData.looking_for}
            onChange={(e) => setFormData({...formData, looking_for: e.target.value})}
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
          >
            <option value="">Select</option>
            <option value="friendship">Friendship</option>
            <option value="relationship">Relationship</option>
            <option value="something casual">Something Casual</option>
            <option value="one night stand">One Night Stand</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={!formData.city || !formData.country}
        >
          {formData.country ? 'Update Details' : 'Save & Continue'}
        </button>
      </form>
    </div>
  );
}