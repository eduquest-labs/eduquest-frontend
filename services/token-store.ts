import { getSession } from "next-auth/react";

let _accessToken: string | null = null;
let _inflightFetch: Promise<string | null> | null = null;

export function getToken(): string | null {
  return _accessToken;
}

export function setToken(token: string | null): void {
  _accessToken = token;
  _inflightFetch = null;
}

export function clearToken(): void {
  _accessToken = null;
  _inflightFetch = null;
}

/**
 * Resolves the in-memory access token, falling back to a session fetch on
 * cold load (e.g. first request after a full page refresh, before
 * SessionSyncer has had a chance to mount and populate the in-memory value).
 */
export async function getTokenWithFallback(): Promise<string | null> {
  if (_accessToken !== null) {
    return _accessToken;
  }
  if (_inflightFetch) {
    return _inflightFetch;
  }

  _inflightFetch = getSession().then((session) => {
    const token = session?.accessToken ?? null;
    _accessToken = token;
    _inflightFetch = null;
    return token;
  });

  return _inflightFetch;
}
