import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { NavigateFunction } from 'react-router';

// ─── Navigation bridge ────────────────────────────────────────────────────────
// Axios interceptors run outside the React component tree, so they can't call
// the useNavigate() hook directly. App.tsx registers the real navigate function
// here once on mount, and this file calls it instead of doing a hard reload.
let navigateRef: NavigateFunction | null = null;
export const setNavigate = (navigate: NavigateFunction) => {
  navigateRef = navigate;
};

// ─── Resolve API base URL ────────────────────────────────────────────────────
// Priority: VITE_API_URL env var → fallback to same-origin (for self-hosted)
const RAW_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? '';
const API_BASE_URL = RAW_URL.endsWith('/')
  ? RAW_URL.slice(0, -1)   // strip trailing slash
  : RAW_URL;

// ─── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  // Default timeout: 60s (handles Render free-tier cold starts of ~30–50s)
  timeout: 60_000,
});

if (import.meta.env.DEV) {
  console.info('[OpenDrive] API base URL:', `${API_BASE_URL}/api`);
}

// ─── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach JWT from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    // If the data is FormData (like a file upload), remove the default Content-Type JSON header
    // so Axios/browser can set it to multipart/form-data with the correct boundary
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Session expired → force re-login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (navigateRef) {
        // Client-side navigation — no full page reload, no dependency on
        // server-side rewrite rules.
        navigateRef('/login', { replace: true });
      } else {
        // Fallback in the rare case this fires before App.tsx has mounted
        // and registered the navigate function (e.g. a 401 during initial load).
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Attach a human-readable message the UI can display directly
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.userMessage =
        'Request timed out. The server may be waking up — please wait a moment and try again.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      error.userMessage =
        'Cannot reach the server. Check that the backend is running and VITE_API_URL is correct.';
    } else if (error.response.status === 413) {
      error.userMessage = 'File is too large. Maximum upload size is 100 MB.';
    } else if (error.response.status === 415) {
      error.userMessage = 'File type not supported.';
    } else if (error.response.status >= 500) {
      error.userMessage = 'Server error. Please try again in a moment.';
    } else if (error.response.status === 403) {
      error.userMessage = 'You do not have permission to do that.';
    } else if (error.response.status === 404) {
      error.userMessage = 'Resource not found.';
    }

    return Promise.reject(error);
  }
);

export default api;