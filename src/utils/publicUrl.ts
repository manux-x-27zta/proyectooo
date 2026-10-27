import { useEffect, useState } from 'react';

/**
 * Publicly accessible Shared App URL for this application when accessed from
 * private developer environments (ais-dev-*) or localhost.
 */
const FALLBACK_PUBLIC_APP_URL =
  'https://ais-pre-ngqzbnnfsf2ohfr36loepr-558667757813.us-east1.run.app';

/**
 * Converts any environment origin/URL into a universally accessible public URL
 * that anyone in the world can open from any mobile phone without owner credentials.
 *
 * - Rewrites private AI Studio editor URLs (`https://ais-dev-...`) -> public shared URL (`https://ais-pre-...`)
 * - Replaces `localhost` / `127.0.0.1` with the public shared URL
 * - Preserves production Cloud Run (`*.run.app`) or custom domains (`https://...`) as-is
 */
export function normalizeToPublicBaseUrl(candidate?: string): string {
  const configuredEnvUrl =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_APP_URL
      ? String(import.meta.env.VITE_PUBLIC_APP_URL).trim()
      : '';

  const rawSource =
    (candidate && candidate.trim()) ||
    configuredEnvUrl ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  if (!rawSource || rawSource === 'MY_APP_URL') {
    return FALLBACK_PUBLIC_APP_URL;
  }

  try {
    const parsed = new URL(rawSource);
    const host = parsed.hostname.toLowerCase();

    // Local development URLs are unreachable from external phones scanning a printed QR
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local')
    ) {
      return FALLBACK_PUBLIC_APP_URL;
    }

    // AI Studio private editor preview (`ais-dev-*`) requires creator login;
    // rewrite to the public shared preview host (`ais-pre-*`) so anyone can open it.
    if (host.startsWith('ais-dev-')) {
      parsed.hostname = `ais-pre-${parsed.hostname.slice('ais-dev-'.length)}`;
      parsed.protocol = 'https:';
    }

    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    return `${parsed.origin}${cleanPath}`;
  } catch {
    return FALLBACK_PUBLIC_APP_URL;
  }
}

let cachedServerPublicUrl: string | null = null;

/**
 * Synchronously returns the best universal public base URL.
 */
export function getPublicAppBaseUrl(): string {
  if (cachedServerPublicUrl) {
    return cachedServerPublicUrl;
  }
  return normalizeToPublicBaseUrl();
}

/**
 * Builds a compact, universally scannable public URL that opens the interactive
 * biological ficha of a specific Colombian species on any mobile device.
 */
export function buildPublicSpeciesUrl(speciesId: string, baseOverride?: string): string {
  const base = (baseOverride || getPublicAppBaseUrl()).replace(/\/+$/, '');
  return `${base}/?s=${encodeURIComponent(speciesId)}`;
}

/**
 * Builds a compact, universally scannable public URL that opens the citizen
 * biodiversity survey pre-selected for a specific species.
 */
export function buildPublicSurveyUrl(speciesId: string, baseOverride?: string): string {
  const base = (baseOverride || getPublicAppBaseUrl()).replace(/\/+$/, '');
  return `${base}/?s=${encodeURIComponent(speciesId)}&v=encuesta`;
}

/**
 * React hook returning the universal public base URL, checking `/api/public-config`
 * once in case a canonical production domain (`APP_URL` / `PUBLIC_APP_URL`) is set on the server.
 */
export function usePublicBaseUrl(): string {
  const [baseUrl, setBaseUrl] = useState<string>(() => getPublicAppBaseUrl());

  useEffect(() => {
    if (cachedServerPublicUrl) {
      setBaseUrl(cachedServerPublicUrl);
      return;
    }

    let active = true;
    fetch('/api/public-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.publicBaseUrl === 'string' && data.publicBaseUrl.trim()) {
          const normalized = normalizeToPublicBaseUrl(data.publicBaseUrl);
          cachedServerPublicUrl = normalized;
          if (active) {
            setBaseUrl(normalized);
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return baseUrl;
}
