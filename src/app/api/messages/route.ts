// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  type: string;
  scheduled_at: string | null;
  sent: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const myId = getUserIdFromRequest(req);
    const otherId = req.nextUrl.searchParams.get("user_id");

    if (!myId || !otherId) {
      return NextResponse.json({ error: "Missing user IDs" }, { status: 400 });
    }

    const { rows } = await pool.query<Message>(
      `SELECT * FROM messages
       WHERE ((sender_id = $1 AND receiver_id = $2)
           OR (sender_id = $2 AND receiver_id = $1))
         AND (sent = true OR sender_id = $1)
       ORDER BY timestamp ASC`,
      [myId, otherId]
    );

    return NextResponse.json(rows);
  } catch (err: unknown) {
    console.error("GET /api/messages error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const myId = getUserIdFromRequest(req);
    if (!myId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const to = String(body.to || "").trim();
    const content = String(body.content || "").trim();
    let type = String(body.type || "normal").trim().toLowerCase();
    const scheduledAt: string | null = body.scheduled_at || null;

    if (!to || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Only allow valid types
    if (!["normal", "once", "scheduled", "bomb"].includes(type)) {
      type = "normal";
    }

    // ✅ Validate scheduled messages
    if (type === "scheduled") {
      if (!scheduledAt) {
        return NextResponse.json(
          { error: "Missing scheduled_at" },
          { status: 400 }
        );
      }
      const dateCheck = new Date(scheduledAt);
      if (isNaN(dateCheck.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduled_at date" },
          { status: 400 }
        );
      }
    }

    const { rows } = await pool.query<Message>(
      `INSERT INTO messages (sender_id, receiver_id, content, type, scheduled_at, sent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        myId,
        to,
        content,
        type,
        scheduledAt, // null for normal/once/bomb, datetime for scheduled
        type === "scheduled" ? false : true
      ]
    );

    return NextResponse.json(rows[0]);
  } catch (err: unknown) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
