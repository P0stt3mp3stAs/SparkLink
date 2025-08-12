import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const friendId = body.friend_id;

    if (!friendId) {
      return NextResponse.json({ error: 'Missing friend_id' }, { status: 400 });
    }

    if (friendId === userId) {
      return NextResponse.json({ error: "Can't add yourself as friend" }, { status: 400 });
    }

    console.log("Add friend request:", { userId, friendId });

    // 1. Add friend to current user's list
    const existingUser = await pool.query('SELECT friends FROM friends WHERE user_id = $1', [userId]);

    if (existingUser.rows.length > 0) {
      await pool.query(
        'UPDATE friends SET friends = array_append(friends, $1::uuid) WHERE user_id = $2 AND NOT ($1::uuid = ANY(friends))',
        [friendId, userId]
      );
      console.log(`✅ Updated friends for user ${userId}`);
    } else {
      await pool.query(
        'INSERT INTO friends (user_id, friends) VALUES ($1, ARRAY[$2::uuid])',
        [userId, friendId]
      );
      console.log(`✅ Inserted new friends row for user ${userId}`);
    }

    // 2. Add current user to friend's list (mutual friendship)
    const existingFriend = await pool.query('SELECT friends FROM friends WHERE user_id = $1', [friendId]);

    if (existingFriend.rows.length > 0) {
      await pool.query(
        'UPDATE friends SET friends = array_append(friends, $1::uuid) WHERE user_id = $2 AND NOT ($1::uuid = ANY(friends))',
        [userId, friendId]
      );
      console.log(`✅ Updated friends for user ${friendId}`);
    } else {
      await pool.query(
        'INSERT INTO friends (user_id, friends) VALUES ($1, ARRAY[$2::uuid])',
        [friendId, userId]
      );
      console.log(`✅ Inserted new friends row for user ${friendId}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Error adding friend:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
