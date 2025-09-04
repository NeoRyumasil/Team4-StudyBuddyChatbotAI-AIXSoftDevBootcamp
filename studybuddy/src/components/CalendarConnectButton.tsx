"use client";
import { useGoogleCalendarToken } from "@/lib/useGoogleCalendarToken";

export default function CalendarConnectButton() {
  const { accessToken, requestAccess } = useGoogleCalendarToken();

  return (
    <button
      onClick={requestAccess}
      className="px-4 py-2 rounded-xl border"
      title="Hubungkan akun Google untuk membuat event"
    >
      {accessToken ? "Google Calendar Tersambung ✅" : "Connect Google Calendar"}
    </button>
  );
}
