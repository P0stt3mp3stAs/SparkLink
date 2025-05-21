// src/app/page.tsx
import AuthButtons from '@/components/AuthButtons'
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Spark Link!</h1>
      <AuthButtons />
      <Link href="/profile" className="text-blue-600 underline">
        Go to Profile
      </Link>
    </main>
  );
}