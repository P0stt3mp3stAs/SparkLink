import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const {
      user_id,
      username,
      name,
      email,
      phone,
      country,
      gender,
      date_of_birth,
      images,
    } = data;

    await pool.query(
      `INSERT INTO profiles 
        (user_id, username, name, email, phone, country, gender, date_of_birth, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id)
       DO UPDATE SET
        username = $2,
        name = $3,
        email = $4,
        phone = $5,
        country = $6,
        gender = $7,
        date_of_birth = $8,
        images = $9`,
      [user_id, username, name, email, phone, country, gender, date_of_birth, images]
    );
    console.log('🌐 DATABASE_URL:', process.env.DATABASE_URL);
    console.log('✅ Profile saved successfully:', data);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ DB Error:', err);
    return NextResponse.json({ error: 'Failed to save profile', details: err }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const query = 'SELECT * FROM profiles WHERE user_id = $1';
    const values = [user_id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });

  } catch (error) {
    console.error('🔥 GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}