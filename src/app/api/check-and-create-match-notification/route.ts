import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

type NotificationInsert = {
  user_id: string;
  from_user_id: string;
  is_read: boolean;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action: string;
      userId?: string;
      likedUserId?: string;
      notificationId?: number;
      limit?: number;
    };
    const { action, userId, likedUserId, notificationId, limit = 50 } = body;

    if (!action) return NextResponse.json({ error: 'Action required' }, { status: 400 });

    if (action === 'like') {
      if (!userId || !likedUserId)
        return NextResponse.json({ error: 'userId and likedUserId required' }, { status: 400 });

      const { data: rowA } = await supabase.from('match').select('matches').eq('user_id', userId).maybeSingle();
      const { data: rowB } = await supabase.from('match').select('matches').eq('user_id', likedUserId).maybeSingle();

      const matchesA = rowA?.matches || [];
      const matchesB = rowB?.matches || [];

      const aLikedB = matchesA.includes(likedUserId);
      const bLikedA = matchesB.includes(userId);

      const isMutual = aLikedB && bLikedA;

      if (isMutual) {
        
        const { data: existingA } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('from_user_id', likedUserId)
          .maybeSingle();

        const { data: existingB } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', likedUserId)
          .eq('from_user_id', userId)
          .maybeSingle();

        const notifInserts: NotificationInsert[] = [];

        if (!existingA) notifInserts.push({ user_id: userId, from_user_id: likedUserId, is_read: false });
        if (!existingB) notifInserts.push({ user_id: likedUserId, from_user_id: userId, is_read: false });

        if (notifInserts.length) {
          await supabase.from('notifications').insert(notifInserts);
        }
      }

      return NextResponse.json({ ok: true, mutual: isMutual });
    }

    if (action === 'getNotifications') {
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: false })
        .limit(limit);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ notifications: data || [] });
    }

    if (action === 'markRead') {
      if (!userId || !notificationId)
        return NextResponse.json({ error: 'userId and notificationId required' }, { status: 400 });

      const { data: notif } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .maybeSingle();

      if (!notif || notif.user_id !== userId)
        return NextResponse.json({ error: 'notification not found or does not belong to user', status: 404 });

      await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'invalid action', status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('❌ Notification API Error:', message);
    return NextResponse.json({ error: message, status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
