import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchAvatarConfig,
  endAvatarSession,
  startAvatarSession,
  type AvatarConfig,
  type AvatarSession,
  type AvatarUsage,
  type StartAvatarInput,
} from "@/lib/api/avatar";

export type AvatarPhase = "loading" | "idle" | "connecting" | "live" | "ending" | "ended" | "error";

export function useAvatarSession() {
  const [phase, setPhase] = useState<AvatarPhase>("loading");
  const [config, setConfig] = useState<AvatarConfig | null>(null);
  const [session, setSession] = useState<AvatarSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [usage, setUsage] = useState<AvatarUsage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref, not state: the 500ms tick must not trigger a re-render loop.
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAvatarConfig()
      .then((next) => {
        if (cancelled) return;
        setConfig(next);
        setUsage(next.usage);
        setPhase("idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load the avatar");
        setPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "live") return;

    const id = window.setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 500);

    return () => window.clearInterval(id);
  }, [phase]);

  const start = useCallback(async (input: StartAvatarInput) => {
    setPhase("connecting");
    setError(null);
    setElapsedSeconds(0);

    try {
      const next = await startAvatarSession(input);
      setSession(next);
      setUsage(next.usage);
      startedAtRef.current = Date.now();
      setPhase("live");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the session");
      setPhase("error");
    }
  }, []);

  const stop = useCallback(async () => {
    if (!session?.conversationId) {
      setPhase("idle");
      return;
    }

    setPhase("ending");

    const seconds =
      startedAtRef.current !== null
        ? Math.floor((Date.now() - startedAtRef.current) / 1000)
        : elapsedSeconds;

    try {
      const result = await endAvatarSession(session.conversationId, seconds);
      setUsage(result.usage);
    } catch (err) {
      // The conversation is already gone from the student's point of view, so
      // surface the message but still leave the live state.
      setError(err instanceof Error ? err.message : "Could not cleanly end the session");
    } finally {
      startedAtRef.current = null;
      setSession(null);
      setPhase("ended");
    }
  }, [session, elapsedSeconds]);

  const reset = useCallback(() => {
    setSession(null);
    setElapsedSeconds(0);
    setError(null);
    startedAtRef.current = null;
    setPhase("idle");
  }, []);

  // Best effort: charge the budget if the student closes the tab mid-session.
  useEffect(() => {
    const flush = () => {
      const conversationId = session?.conversationId;
      const startedAt = startedAtRef.current;
      if (!conversationId || startedAt === null) return;

      const token = localStorage.getItem("cloop_token");
      if (!token) return;

      const apiBase = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";
      const seconds = Math.floor((Date.now() - startedAt) / 1000);

      // keepalive, not sendBeacon: this route needs an Authorization header and
      // sendBeacon cannot set one, so it would always 401.
      fetch(`${apiBase}/api/avatar/session/end`, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId, elapsedSeconds: seconds }),
      }).catch(() => {
        // Nothing more we can do. Tavus ends the call itself after
        // max_call_duration, so the concurrency slot is never leaked.
      });
    };

    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [session]);

  return {
    phase,
    config,
    session,
    elapsedSeconds,
    usage,
    error,
    start,
    stop,
    reset,
  };
}