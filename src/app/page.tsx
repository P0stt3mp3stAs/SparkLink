// src/app/page.tsx
'use client'

import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScrollTracker from '@/components/ScrollTracker';
import StackedButtons from '@/components/StackedButtons';

export default function HomePage() {
  const auth = useAuth();
  const router = useRouter();

  // Redirect if logged in
  useEffect(() => {
    if (auth.isAuthenticated) {
      router.replace('/profile');
    }
  }, [auth.isAuthenticated, router]);

  // Show loading screen while logging in or redirecting
  if (auth.isLoading || auth.isAuthenticated) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-lg font-medium text-gray-600">Just a moment...</p>
      </main>
    );
  }

  // Function to handle authentication
  const handleAuth = () => {
    // Trigger the authentication process
    auth.signinRedirect();
  };

  // Define the buttons for StackedButtons
  const stackedButtons = [
    {
      bgClass: "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 transition-all duration-200",
      content: "Sign In",
      onClick: handleAuth
    },
    {
      bgClass: "bg-purple-500 hover:bg-purple-600 active:bg-purple-700 transition-all duration-200", 
      content: "About",
      onClick: () => router.push('/about')
    },
    {
      bgClass: "bg-green-500 hover:bg-green-600 active:bg-green-700 transition-all duration-200",
      content: "Contact",
      onClick: () => router.push('/contact')
    },
    {
      bgClass: "bg-pink-500 hover:bg-pink-600 active:bg-pink-700 transition-all duration-200",
      content: "Smach",
      onClick: () => router.push('/smach')
    }
  ];

  return (
    <main className="relative">
      {/* Scroll experience */}
      <ScrollTracker />
      
      {/* StackedButtons overlay - fixed position in bottom right */}
      <div className="flex bg-black justify-center py-20">
        <StackedButtons 
          buttons={stackedButtons}
          size={160}
        />
      </div>
    </main>
  );
}