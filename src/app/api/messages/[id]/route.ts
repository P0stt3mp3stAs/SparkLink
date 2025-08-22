import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  try {
    const myId = getUserIdFromRequest(request);
    if (!myId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rowCount } = await pool.query(
      `DELETE FROM messages
       WHERE id = $1
       AND (sender_id = $2 OR receiver_id = $2)`,
      [id, myId]
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { error: "Message not found or not yours" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete message error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}