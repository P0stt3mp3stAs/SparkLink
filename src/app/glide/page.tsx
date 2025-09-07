// src/app/glide/page.tsx
'use client';

import { Suspense } from 'react';
import GlidePageContent from './GlidePageContent';

export default function GlidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <GlidePageContent />
    </Suspense>
  );
}
