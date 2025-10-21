// Prefer Vite env variables at build time; fall back to localhost for local dev
const VITE_HTTP_URL = import.meta.env.VITE_HTTP_URL as string | undefined;
const VITE_WS_URL = import.meta.env.VITE_WS_URL as string | undefined;

export const HTTP_URL = VITE_HTTP_URL || 'http://localhost:3000';
export const WS_URL = VITE_WS_URL || 'ws://localhost:8080';