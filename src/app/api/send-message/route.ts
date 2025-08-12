// src/app/api/send-message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/getUserIdFromRequest';

export async function POST(req: NextRequest) {
  try {
    const myId = getUserIdFromRequest(req);
    const { to, content } = await req.json();

    if (!myId || !to || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [myId, to, content]
    );

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
