import axios from 'axios';

const RAW_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? '';
const BASE = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

/** Ping the backend to wake it from Render free-tier sleep.
 *  Silently ignores failures — purely a UX optimisation. */
export async function pingBackend(): Promise<boolean> {
  try {
    await axios.get(`${BASE}/ping`, { timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}
