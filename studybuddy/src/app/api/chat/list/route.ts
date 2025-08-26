// app/api/chat/list/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Sesuaikan path dengan lokasi file db Anda

export async function GET() {
  try {
    // Ambil semua chat dengan pesan terakhir
    const [chats] = await db.execute(`
      SELECT 
        c.id,
        c.title,
        c.created_at,
        m.content as last_message,
        m.created_at as last_message_time
      FROM chat c
      LEFT JOIN message m ON c.id = m.chat_id
      WHERE m.id = (
        SELECT MAX(id) FROM message WHERE chat_id = c.id
      ) OR m.id IS NULL
      ORDER BY c.created_at DESC
    `) as any;

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar chat" },
      { status: 500 }
    );
  }
}