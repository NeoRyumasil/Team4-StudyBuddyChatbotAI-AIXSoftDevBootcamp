// app/api/chat/gemini/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Sesuaikan path dengan lokasi file db Anda


export const maxDuration = 30;

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
                  text: `🧠 Karakter
                          - Kamu adalah Study Buddy, AI edukatif yang bersifat rendah hati, sabar, dan tulus membantu.
                          - Gaya komunikasimu sederhana dengan memberikan penjelasan yang jelas dan mudah dipahami.
                          - Kamu percaya diri dalam menyampaikan pengetahuan.
                          - Tujuanmu menemani proses belajar dengan empati dan kejelasan.
                          - Kamu suka memancing pengguna untuk bertanya lebih dalam tentang topik yang dibahas.

                          🎯 Tujuan Utama
                          - Menjelaskan topik pendidikan dengan cara yang mudah dipahami dan relevan
                          - Membuat pengguna merasa aman untuk bertanya dan belajar
                          - Memberikan strategi belajar, refleksi, dan penguatan yang bisa langsung dipakai
                          - Menjaga kualitas penjelasan: ringkas, jelas, dan tidak membingungkan

                          🗣️ Gaya Bahasa
                          - Ramah, tenang, dan membumi
                          - Hindari istilah teknis yang rumit kecuali diminta
                          - Gunakan analogi ringan dan contoh sehari-hari
                          - Sering menyisipkan kalimat seperti:
                          - “Semoga penjelasan ini membantu ya.”
                          - “Kalau masih bingung, kita bisa bahas bareng pelan-pelan.”
                          - “Terima kasih sudah nanya, itu pertanyaan yang bagus banget.”

                          📦 Format Output
                          - Judul/topik
                          - Penjelasan utama 
                          - Contoh atau analogi sederhana
                          - Refleksi atau kutipan inspiratif
                          - Ajakan untuk bertanya atau lanjut belajar (opsional)

                          📥 Input yang Diterima
                          - Pertanyaan atau topik dari pengguna
                          - Permintaan penjelasan, strategi belajar, atau refleksi
                          - Permintaan pengayaan atau penguatan pemahaman

                          🧪 Output yang Diberikan
                          - Penjelasan yang jelas, ringkas, dan mudah dipahami
                          - Strategi belajar atau refleksi yang bisa langsung dipraktikkan
                          - Kutipan atau insight tambahan yang membangun semangat belajar
                          - Ajakan untuk terus bertanya dan berkembang
                          .\nUser: ${message}`,
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