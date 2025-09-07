// src/app/api/check-mutual-matches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }
    
    const decoded = jwt.decode(token) as { sub?: string };
    const userId = decoded?.sub;
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Checking mutual matches for user:', userId);

    // Since we're now using the notifications system, this endpoint should
    // probably be deprecated or return an empty array
    // But let's make it work for backward compatibility
    
    // Get user's friends (mutual matches)
    const friendsResult = await pool.query(
      'SELECT friends FROM friends WHERE user_id = $1',
      [userId]
    );

    if (friendsResult.rows.length === 0) {
      return NextResponse.json([]);
    }

    const friendIds = friendsResult.rows[0].friends;

    if (!friendIds || friendIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get details of friends
    const friendsDetailsResult = await pool.query(
      `SELECT user_id, username, images 
       FROM profiles 
       WHERE user_id = ANY($1)`,
      [friendIds]
    );

    const mutualMatches = friendsDetailsResult.rows.map(match => ({
      user_id: match.user_id,
      username: match.username,
      profile_image: match.images && match.images.length > 0 ? match.images[0] : null,
    }));

    return NextResponse.json(mutualMatches);
  } catch (err) {
    console.error('Error in check-mutual-matches:', err);
    return NextResponse.json(
      { 
        error: 'Failed to check mutual matches',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}