// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // needed for Supabase
  },
});

export async function GET() {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT 
        p.user_id,
        p.username,
        p.name,
        p.email,
        p.phone,
        p.country,
        p.date_of_birth,
        p.gender,
        p.images,
        p.created_at,
        ud.height_cm,
        ud.weight_kg,
        ud.location,
        ud.sexuality,
        ud.looking_for
      FROM profiles p
      LEFT JOIN user_details ud 
        ON ud.user_id::uuid = p.user_id
      ORDER BY p.created_at DESC
    `);

    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err: any) {
    console.error('❌ Error fetching users:', err);
    return NextResponse.json({ error: err.message || 'Failed to load users' }, { status: 500 });
  }
}
