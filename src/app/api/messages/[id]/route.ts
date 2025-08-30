import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    await client.query("DELETE FROM messages WHERE id = $1", [id]);
    client.release();

    return NextResponse.json({ message: "Message deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting message:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
