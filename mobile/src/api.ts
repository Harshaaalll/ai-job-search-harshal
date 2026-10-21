import * as FileSystem from "expo-file-system";
import type { Status } from "./tracker";
import type { DashboardState, JobAction, JobDetail, TrackerRow } from "./types";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export interface Connection {
  baseUrl: string;
  token: string;
}

/** "192.168.1.5:8787" -> "http://192.168.1.5:8787"; strips trailing slashes. */
export function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

/** Tracker file paths are stored as .tex; the server serves the compiled PDF next to it. */
export function pdfPath(file: string): string {
  return file.replace(/\.(tex|typ)$/i, ".pdf");
}

export function createApi({ baseUrl, token }: Connection) {
  const headers = (extra: Record<string, string> = {}): Record<string, string> => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  });

  async function request<T>(path: string, init: RequestInit = {}, timeoutMs = 15000): Promise<T> {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetch(`${baseUrl}${path}`, { ...init, signal: ctl.signal });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = res.status === 401 ? "Wrong or missing token" : (body as { error?: string }).error || `HTTP ${res.status}`;
        throw new ApiError(msg, res.status);
      }
      return body as T;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      if (e instanceof Error && e.name === "AbortError") throw new ApiError("Server did not respond in time", 0);
      throw new ApiError("Cannot reach the server. Check the address, Wi-Fi/VPN and that it is running.", 0);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    state: () => request<DashboardState>("/api/state", { headers: headers(), cache: "no-store" }),

    detail: (key: string) =>
      request<JobDetail>(`/api/detail?key=${encodeURIComponent(key)}`, { headers: headers() }, 20000),

    action: (action: JobAction | "run", key?: string) =>
      request<{ ok: true }>("/api/action", {
        method: "POST",
        headers: headers({ "Content-Type": "application/json", "X-Job-Dashboard": "1" }),
        body: JSON.stringify({ action, ...(key ? { key } : {}) }),
      }),

    markRowApplied: (company: string, role: string) =>
      request<{ ok: true }>("/api/action", {
        method: "POST",
        headers: headers({ "Content-Type": "application/json", "X-Job-Dashboard": "1" }),
        body: JSON.stringify({ action: "applied_row", company, role }),
      }),

    /** Set a tracker row's status (/outcome vocabulary); the row is identified by company + role + date. */
    setRowStatus: (row: TrackerRow, status: Status, note = "") =>
      request<{ ok: true }>("/api/action", {
        method: "POST",
        headers: headers({ "Content-Type": "application/json", "X-Job-Dashboard": "1" }),
        body: JSON.stringify({ action: "status_row", company: row.company, role: row.role, date: row.date, status, note }),
      }),

    logFollowUp: (row: TrackerRow) =>
      request<{ ok: true }>("/api/action", {
        method: "POST",
        headers: headers({ "Content-Type": "application/json", "X-Job-Dashboard": "1" }),
        body: JSON.stringify({ action: "followup_row", company: row.company, role: row.role, date: row.date }),
      }),

    /** Download a CV / cover letter PDF with the bearer token and return a local file URI. */
    async downloadFile(repoPath: string): Promise<string> {
      const pdf = pdfPath(repoPath);
      const name = pdf.split("/").pop() || "document.pdf";
      const dest = `${FileSystem.cacheDirectory}${name}`;
      const url = `${baseUrl}/files/${pdf.split("/").map(encodeURIComponent).join("/")}`;
      const res = await FileSystem.downloadAsync(url, dest, { headers: headers() });
      if (res.status !== 200) {
        throw new ApiError(res.status === 404 ? "PDF not found (compile it first)" : `Download failed (${res.status})`, res.status);
      }
      return res.uri;
    },
  };
}

export type Api = ReturnType<typeof createApi>;
