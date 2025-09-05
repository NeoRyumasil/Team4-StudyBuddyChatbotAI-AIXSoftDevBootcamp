// app/api/chat/gemini/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Sesuaikan path dengan lokasi file db Anda

// Helper function untuk deteksi permintaan jadwal
function detectScheduleRequest(message: string): boolean {
  const scheduleKeywords = [
    'jadwal', 'schedule', 'buat jadwal', 'tambah jadwal',
    'reminder', 'pengingat', 'ingatkan', 'kalender',
    'belajar hari', 'study schedule', 'waktu belajar'
  ];
  
  const lowerMessage = message.toLowerCase();
  return scheduleKeywords.some(keyword => lowerMessage.includes(keyword));
}

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

    // Deteksi apakah ini permintaan untuk membuat jadwal
    const isScheduleRequest = detectScheduleRequest(message);
    
    let systemPrompt = `Kamu adalah StudyBuddy AI untuk Quality Education. Jawablah secara jelas dan mendidik.`;
    
    if (isScheduleRequest) {
      systemPrompt += `\n\nUser ingin membuat jadwal belajar. Bantu dengan format JSON untuk membuat kalendar:
      
PENTING: Jika user memberikan informasi lengkap untuk jadwal belajar, berikan response dalam format:
{
  "scheduleAction": true,
  "eventData": {
    "title": "Nama kegiatan",
    "subject": "Mata pelajaran",
    "startDateTime": "2024-MM-DDTHH:mm:00+07:00",
    "endDateTime": "2024-MM-DDTHH:mm:00+07:00",
    "description": "Deskripsi kegiatan",
    "location": "Lokasi (opsional)"
  },
  "message": "Pesan konfirmasi untuk user"
}

Jika informasi belum lengkap, tanyakan detail yang dibutuhkan seperti:
- Mata pelajaran/topik
- Tanggal (format: DD/MM/YYYY)
- Waktu mulai (format: HH:mm)
- Durasi atau waktu selesai
- Lokasi (opsional)`;
    }
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
                  text: `${systemPrompt}\nUser: ${message}`,
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

    // Cek apakah AI response mengandung scheduleAction
    let finalMessage = aiMessage;
    
    try {
      // Coba parse JSON dari response AI
      const jsonMatch = aiMessage.match(/\{[\s\S]*"scheduleAction":\s*true[\s\S]*\}/);
      
      if (jsonMatch) {
        const scheduleData = JSON.parse(jsonMatch[0]);
        
        if (scheduleData.scheduleAction && scheduleData.eventData) {
          // Panggil API untuk membuat calendar event
          const calendarResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/calendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleData.eventData),
          });
          
          const calendarResult = await calendarResponse.json();
          
          if (calendarResult.success) {
            finalMessage = `✅ ${scheduleData.message}\n\n📅 **Berhasil ditambahkan ke Google Calendar!**\n📚 ${scheduleData.eventData.title} - ${scheduleData.eventData.subject}\n🕒 ${new Date(scheduleData.eventData.startDateTime).toLocaleString('id-ID')}\n\n[🔗 Lihat di Google Calendar](${calendarResult.eventLink})`;
          } else {
            finalMessage = `${scheduleData.message}\n\n❌ Gagal menambahkan ke Google Calendar: ${calendarResult.error}`;
          }
        }
      }
    } catch (parseError) {
      // Jika gagal parse JSON, gunakan message asli
      console.log('Not a schedule JSON response, using original message');
    }

    // Simpan response AI ke database
    await db.execute(
      'INSERT INTO message (chat_id, role, content) VALUES (?, ?, ?)',
      [chatId, 'ai', finalMessage]
    );

    return NextResponse.json({ reply: finalMessage });
  } catch (error) {
    console.error('Error in Gemini chat:', error);
    return NextResponse.json(
      { reply: "Terjadi kesalahan dalam memproses permintaan." },
      { status: 500 }
    );
  }
}