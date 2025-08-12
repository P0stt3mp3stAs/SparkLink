// src/app/api/my-friends/route.ts
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

    // get friend ids
    const friendsRes = await pool.query(
      'SELECT friends FROM friends WHERE user_id = $1',
      [userId]
    );

    console.log("friendsRes.rows:", friendsRes.rows);

    if (friendsRes.rows.length === 0) {
      return NextResponse.json([]);
    }

    const friendIds = friendsRes.rows[0].friends;
    console.log("friendIds from db:", friendIds);

    if (!friendIds || friendIds.length === 0) {
      return NextResponse.json([]);
    }

    // look up each friend profile
    const profilesRes = await pool.query(
      `SELECT user_id, username, images, date_of_birth 
       FROM profiles 
       WHERE user_id = ANY($1)`,
      [friendIds]
    );

    const profiles = profilesRes.rows.map((profile) => {
      const profile_image = (profile.images && profile.images.length > 0) ? profile.images[0] : null;

      let age = null;
      if (profile.date_of_birth) {
        const birth = new Date(profile.date_of_birth);
        const today = new Date();
        age = today.getFullYear() - birth.getFullYear();
        if (
          today.getMonth() < birth.getMonth() ||
          (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
        ) {
          age--;
        }
      }

      return {
        user_id: profile.user_id,
        username: profile.username,
        profile_image,
        age
      };
    });

    return NextResponse.json(profiles);
  } catch (err) {
    console.error('❌ Error fetching my friends:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
