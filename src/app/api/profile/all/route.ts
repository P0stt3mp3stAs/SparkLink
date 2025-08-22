// src/app/api/profile/all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currentUserId = searchParams.get('current_user_id');

    // Get all profiles
    const query = 'SELECT * FROM profiles';
    const result = await pool.query(query);

    let profiles = result.rows;

    // Filter out current user
    if (currentUserId) {
      profiles = profiles.filter(profile => profile.user_id !== currentUserId);
    }

    // Filter out users that current user has interacted with
    if (currentUserId) {
      try {
        const [matchesResult, dismatchesResult] = await Promise.all([
          supabase
            .from('match')
            .select('matches')
            .eq('user_id', currentUserId)
            .single(),
          supabase
            .from('dismatch')
            .select('dismatches')
            .eq('user_id', currentUserId)
            .single()
        ]);

        const matches = matchesResult.data?.matches || [];
        const dismatches = dismatchesResult.data?.dismatches || [];
        const excludedIds = [...matches, ...dismatches];

        if (excludedIds.length > 0) {
          profiles = profiles.filter(profile => 
            !excludedIds.includes(profile.user_id)
          );
        }
      } catch (error) {
        console.error('Error fetching user interactions:', error);
        // Continue without filtering if there's an error
      }
    }

    return NextResponse.json(profiles, { status: 200 });
  } catch (error) {
    console.error('🔥 GET /api/profile/all error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}