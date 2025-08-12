// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/getUserIdFromRequest';

export async function GET(req: NextRequest) {
  try {
    const myId = getUserIdFromRequest(req);
    const otherId = req.nextUrl.searchParams.get('user_id');

    if (!myId || !otherId) {
      return NextResponse.json({ error: 'Missing user IDs' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY timestamp ASC`,
      [myId, otherId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
