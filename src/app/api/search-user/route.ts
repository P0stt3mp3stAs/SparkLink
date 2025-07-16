import { NextResponse } from 'next/server';
import Pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    console.log("🔍 Searching for user_id:", user_id);

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const result = await Pool.query(
      `SELECT user_id, username, images FROM profiles WHERE user_id = $1 LIMIT 1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({}, { status: 404 });
    }

    const user = result.rows[0];
    const profile_image = (user.images && user.images.length > 0) ? user.images[0] : null;

    return NextResponse.json({
      user_id: user.user_id,
      username: user.username,
      profile_image,
    });
  } catch (err) {
    console.error("🔥 API ERROR:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
