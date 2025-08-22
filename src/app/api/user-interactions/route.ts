// src/app/api/user-interactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { message: 'Missing user_id' },
        { status: 400 }
      );
    }

    // Get both matches and dismatches
    const [matchesResult, dismatchesResult] = await Promise.all([
      supabase
        .from('match')
        .select('matches')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('dismatch')
        .select('dismatches')
        .eq('user_id', userId)
        .single()
    ]);

    const matches = matchesResult.data?.matches || [];
    const dismatches = dismatchesResult.data?.dismatches || [];

    return NextResponse.json({
      matches,
      dismatches,
      allInteractions: [...matches, ...dismatches]
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}