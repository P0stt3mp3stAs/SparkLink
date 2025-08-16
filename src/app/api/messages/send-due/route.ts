// src/app/api/messages/send-due/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

export async function POST(req: NextRequest) {
  try {
    const myId = getUserIdFromRequest(req);
    if (!myId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Update all scheduled messages that are due
    const { rows } = await pool.query(
      `UPDATE messages
       SET sent = true,
           type = 'scheduled',
           timestamp = scheduled_at
       WHERE sender_id = $1
         AND type = 'scheduled'
         AND sent = false
         AND scheduled_at <= NOW()
       RETURNING *`,
      [myId]
    );

    return NextResponse.json({ updated: rows.length });
  } catch (err) {
    console.error("POST /api/messages/send-due error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
