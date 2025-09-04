"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export function useGoogleCalendarToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tokenClientRef = useRef<any>(null);

  useEffect(() => {
    if (!window.google) return;

    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: "https://www.googleapis.com/auth/calendar.events",
      prompt: "consent",
      callback: (res: any) => {
        if (res.error) {
          setError(res.error);
          console.error("OAuth error:", res.error);
        } else {
          setAccessToken(res.access_token);
          setError(null);
        }
      },
    });
  }, []);

  const requestAccess = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError("Google Client ID not configured");
      return;
    }
    tokenClientRef.current?.requestAccessToken({ prompt: "consent" });
  };

  return { accessToken, requestAccess, error };
}
