// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

export async function GET(req: NextRequest) {
  try {
    const myId = getUserIdFromRequest(req);
    const otherId = req.nextUrl.searchParams.get("user_id");

    if (!myId || !otherId) {
      return NextResponse.json({ error: "Missing user IDs" }, { status: 400 });
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

    if (!to || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Only allow "normal" or "once"
    if (!["normal", "once"].includes(type)) {
      type = "normal";
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [myId, to, content, type]
    );

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
