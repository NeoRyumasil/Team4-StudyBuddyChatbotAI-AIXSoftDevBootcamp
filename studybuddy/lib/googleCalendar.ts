// lib/googleCalendar.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials jika sudah ada refresh token
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export interface StudyScheduleEvent {
  title: string;
  description?: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}

export async function createStudyEvent(event: StudyScheduleEvent) {
  try {
    const calendarEvent = {
      summary: `📚 ${event.title} - ${event.subject}`,
      description: `Jadwal Belajar: ${event.subject}\n\n${event.description || 'Dibuat oleh StudyBuddy AI'}`,
      start: {
        dateTime: event.startDateTime,
        timeZone: 'Asia/Jakarta',
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: 'Asia/Jakarta',
      },
      location: event.location,
      colorId: '9', // Blue color for study events
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: calendarEvent,
    });

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      data: response.data,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}