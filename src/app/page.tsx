// src/app/page.tsx
'use client'

import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthButtons from '@/components/AuthButtons';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

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

  return (
    <main>
      <h1>Welcome to Spark Link!</h1>
      <Navbar />
      <AuthButtons />
      <Link href="/profile" className="text-blue-600 underline">
        Go to Profile
      </Link>
      <Link href="/fade" className="text-red-500 underline">
        Go to fade
      </Link>
    </main>
  );
}