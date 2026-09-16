"use client";

import { useEffect, useState } from "react";
import { API_URL } from "./api";

// Read-only view of the platform session (the rj_session cookie on the API
// origin, shared with the account/fitness/habit/journal apps). The site has no
// login UI — the header links to the account app for that — but a signed-in
// visitor gets a personalised header and prefilled forms.
//
// One module-level store so Header, Footer and the contact page share a single
// /me request per page load.

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  isGuest: boolean;
}

let cachedUser: SessionUser | null = null;
let loaded = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function load(): Promise<void> {
  if (!inflight) {
    inflight = fetch(`${API_URL}/api/account/auth/me`, { credentials: "include" })
      .then(async (res) => {
        cachedUser = res.ok ? ((await res.json()).user as SessionUser) : null;
      })
      .catch(() => {
        cachedUser = null;
      })
      .finally(() => {
        loaded = true;
        emit();
      });
  }
  return inflight;
}

// Session state for client components. Guests count as signed out here: the
// portfolio site has nothing for a guest account to do.
export function useSession(): { user: SessionUser | null; loading: boolean } {
  const [, force] = useState(0);

  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    if (!loaded) void load();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const user = cachedUser && !cachedUser.isGuest ? cachedUser : null;
  return { user, loading: !loaded };
}

export async function logoutSession(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/account/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Even if the request fails, drop the local state; the next /me decides.
  }
  cachedUser = null;
  emit();
}
