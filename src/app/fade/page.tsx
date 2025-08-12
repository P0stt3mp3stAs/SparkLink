'use client';
import AuthButtons from '@/components/AuthButtons';
import { CardShuffle } from '@/components/icons/CardShuffle';
export default function Fade() {

  return (
    <main className="bg-red-500 h-screen w-screen flex items-center justify-center text-black">
      hi this is fade
      <AuthButtons />
      <CardShuffle />
    </main>
  );
}
