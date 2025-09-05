// app/api/calendar/route.ts
import { NextResponse } from "next/server";
import { createStudyEvent, StudyScheduleEvent } from "@/lib/googleCalendar";

export async function POST(req: Request) {
  try {
    const eventData: StudyScheduleEvent = await req.json();

    // Validasi input
    if (!eventData.title || !eventData.subject || !eventData.startDateTime || !eventData.endDateTime) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Diperlukan: title, subject, startDateTime, endDateTime" },
        { status: 400 }
      );
    }

    // Buat event di Google Calendar
    const result = await createStudyEvent(eventData);

    if (!result.success) {
      return NextResponse.json(
        { error: `Gagal membuat event: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil ditambahkan ke Google Calendar",
      eventId: result.eventId,
      eventLink: result.eventLink,
      calendarData: {
        title: eventData.title,
        subject: eventData.subject,
        startTime: eventData.startDateTime,
        endTime: eventData.endDateTime,
        location: eventData.location
      }
    });

  } catch (error) {
    console.error('Error in calendar API:', error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}