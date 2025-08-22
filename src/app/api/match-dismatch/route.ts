// src/app/api/match-dismatch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId, targetUserId, action } = await req.json();

    if (!userId || !targetUserId || !action) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'dismatch') {
      // DISMATCH LOGIC (existing code)
      const { data: existingRecord, error: checkError } = await supabase
        .from('dismatch')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Supabase check error:', checkError);
        return NextResponse.json(
          { message: 'Database error' },
          { status: 500 }
        );
      }

      if (existingRecord) {
        if (!existingRecord.dismatches.includes(targetUserId)) {
          const { error: updateError } = await supabase
            .from('dismatch')
            .update({ 
              dismatches: [...existingRecord.dismatches, targetUserId] 
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Supabase update error:', updateError);
            return NextResponse.json(
              { message: 'Failed to update dismatches' },
              { status: 500 }
            );
          }
        }
      } else {
        const { error: insertError } = await supabase
          .from('dismatch')
          .insert({ 
            user_id: userId, 
            dismatches: [targetUserId] 
          });

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          return NextResponse.json(
            { message: 'Failed to create dismatch record' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json({ message: 'Added to dismatches' });
      
    } else if (action === 'match') {
      // MATCH LOGIC (new code)
      const { data: existingRecord, error: checkError } = await supabase
        .from('match')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Supabase check error:', checkError);
        return NextResponse.json(
          { message: 'Database error' },
          { status: 500 }
        );
      }

      if (existingRecord) {
        if (!existingRecord.matches.includes(targetUserId)) {
          const { error: updateError } = await supabase
            .from('match')
            .update({ 
              matches: [...existingRecord.matches, targetUserId] 
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Supabase update error:', updateError);
            return NextResponse.json(
              { message: 'Failed to update matches' },
              { status: 500 }
            );
          }
        }
      } else {
        const { error: insertError } = await supabase
          .from('match')
          .insert({ 
            user_id: userId, 
            matches: [targetUserId] 
          });

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          return NextResponse.json(
            { message: 'Failed to create match record' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json({ message: 'Added to matches' });
      
    } else {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS method remains the same
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}