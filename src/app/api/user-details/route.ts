// src/app/api/user-details/route.ts
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const query = 'SELECT * FROM user_details WHERE user_id = $1';
    const values = [user_id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User details not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });

  } catch (error) {
    console.error('🔥 GET /api/user-details error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      user_id,
      height_cm,
      weight_kg,
      location,
      sexuality,
      looking_for,
    } = data;

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const query = `
      INSERT INTO user_details 
        (user_id, height_cm, weight_kg, location, sexuality, looking_for)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id)
      DO UPDATE SET
        height_cm = $2,
        weight_kg = $3,
        location = $4,
        sexuality = $5,
        looking_for = $6
    `;
    
    const values = [user_id, height_cm, weight_kg, location, sexuality, looking_for];

    await pool.query(query, values);
    console.log('✅ User details saved successfully:', data);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('❌ DB Error:', err);
    return NextResponse.json({ error: 'Failed to save user details', details: err }, { status: 500 });
  }
}