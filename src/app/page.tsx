// src/app/page.tsx
'use client'

import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthButtons from '@/components/AuthButtons';

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
      <AuthButtons />
    </main>
  );
}