// app/api/chat/gemini/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Sesuaikan path dengan lokasi file db Anda

export async function POST(req: Request) {
  try {
    const { message, chatId } = await req.json();

    // Validasi chatId
    if (!chatId) {
      return NextResponse.json(
        { error: "chatId diperlukan" },
        { status: 400 }
      );
    }

    // Simpan pesan user ke database terlebih dahulu
    await db.execute(
      'INSERT INTO message (chat_id, role, content) VALUES (?, ?, ?)',
      [chatId, 'user', message]
    );

    // Panggil API Gemini
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Kamu adalah AI untuk Quality Education. Jawablah secara jelas dan mendidik.\nUser: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const aiMessage =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, saya tidak bisa menjawab sekarang.";

    // Simpan response AI ke database
    await db.execute(
      'INSERT INTO message (chat_id, role, content) VALUES (?, ?, ?)',
      [chatId, 'ai', aiMessage]
    );

    return NextResponse.json({ reply: aiMessage });
  } catch (error) {
    console.error('Error in Gemini chat:', error);
    return NextResponse.json(
      { reply: "Terjadi kesalahan dalam memproses permintaan." },
      { status: 500 }
    );
  }
}