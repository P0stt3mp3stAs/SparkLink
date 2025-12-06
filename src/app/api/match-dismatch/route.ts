// src/app/api/match-dismatch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

function isSupabaseNotFoundErr(err: unknown): boolean {
  if (!err) return false;
  const maybeErr = err as { code?: string; message?: string };

  return maybeErr.code === 'PGRST116' || maybeErr.message?.includes('Results contain 0 rows') || false;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, targetUserId, action } = await req.json();

    if (!userId || !targetUserId || !action) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'dismatch') {
      const { data: existingRecord, error: checkError } = await supabase
        .from('dismatch')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && !isSupabaseNotFoundErr(checkError)) {
        console.error('Supabase check error (dismatch):', checkError);
        return NextResponse.json({ message: 'Database error' }, { status: 500 });
      }

      if (!existingRecord) {
        const { error: insertError } = await supabase
          .from('dismatch')
          .insert({ user_id: userId, dismatches: [targetUserId] });

        if (insertError) {
          console.error('Supabase insert error (dismatch):', insertError);
          return NextResponse.json({ message: 'Failed to create dismatch record' }, { status: 500 });
        }
      } else {
        const current = Array.isArray(existingRecord.dismatches) ? existingRecord.dismatches : [];
        if (!current.includes(targetUserId)) {
          current.push(targetUserId);
          const { error: updateError } = await supabase
            .from('dismatch')
            .update({ dismatches: current })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Supabase update error (dismatch):', updateError);
            return NextResponse.json({ message: 'Failed to update dismatches' }, { status: 500 });
          }
        }
      }

      return NextResponse.json({ message: 'Added to dismatches' });
    }

    if (action === 'match') {
      const { data: existingRecord, error: checkError } = await supabase
        .from('match')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && !isSupabaseNotFoundErr(checkError)) {
        console.error('Supabase check error (match):', checkError);
        return NextResponse.json({ message: 'Database error' }, { status: 500 });
      }

      if (!existingRecord) {
        const { error: insertError } = await supabase
          .from('match')
          .insert({ user_id: userId, matches: [targetUserId] });

        if (insertError) {
          console.error('Supabase insert error (match):', insertError);
          return NextResponse.json({ message: 'Failed to create match record' }, { status: 500 });
        }
      } else {
        const currentMatches = Array.isArray(existingRecord.matches) ? existingRecord.matches : [];
        if (!currentMatches.includes(targetUserId)) {
          currentMatches.push(targetUserId);
          const { error: updateError } = await supabase
            .from('match')
            .update({ matches: currentMatches })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Supabase update error (match):', updateError);
            return NextResponse.json({ message: 'Failed to update matches' }, { status: 500 });
          }
        }
      }

      try {
        await fetch(`${BASE_URL}/api/check-and-create-match-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'like',
            userId,
            likedUserId: targetUserId,
          }),
        });
      } catch (err) {
        // Log but do not fail the match operation
        console.error('Failed to call notification route from match-dismatch:', err);
      }

      return NextResponse.json({ message: 'Added to matches' });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API route error (match-dismatch):', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
