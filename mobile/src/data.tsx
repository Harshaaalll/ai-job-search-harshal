import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, createApi, normalizeBaseUrl, type Api } from "./api";
import { DEFAULT_FILTERS, type Filters } from "./filters";
import type { DashboardState, JobAction } from "./types";

const URL_KEY = "dashboard_url";
const TOKEN_KEY = "dashboard_token"; // secure store: it is a credential
const FILTERS_KEY = "filters_v1";
const POLL_MS = 5000; // while the pipeline is running

interface DataContextValue {
  ready: boolean; // saved connection + filters have been loaded from storage
  configured: boolean;
  baseUrl: string;
  token: string;
  api: Api | null;
  state: DashboardState | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  act: (action: JobAction | "run", key?: string) => Promise<void>;
  saveConnection: (url: string, token: string) => Promise<void>;
  filters: Filters;
  setFilters: (f: Filters) => void;
}

const Ctx = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData must be used inside <DataProvider>");
  return v;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<DashboardState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);

  const api = useMemo(() => (baseUrl ? createApi({ baseUrl, token }) : null), [baseUrl, token]);

  // Load the saved connection and filters once.
  useEffect(() => {
    (async () => {
      try {
        const [url, tok, savedFilters] = await Promise.all([
          SecureStore.getItemAsync(URL_KEY),
          SecureStore.getItemAsync(TOKEN_KEY),
          AsyncStorage.getItem(FILTERS_KEY),
        ]);
        if (url) setBaseUrl(url);
        if (tok) setToken(tok);
        // Spread over the defaults so a filter added in a later version never reads as undefined.
        if (savedFilters) setFiltersState({ ...DEFAULT_FILTERS, ...JSON.parse(savedFilters) });
      } catch {
        // Storage can be unavailable (e.g. a fresh simulator); start from defaults.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const refresh = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      setState(await api.state());
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Fetch when the connection changes, and poll while the pipeline runs.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const running = !!state?.status?.running;
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => refreshRef.current(), POLL_MS);
    return () => clearInterval(id);
  }, [running]);

  const act = useCallback(
    async (action: JobAction | "run", key?: string) => {
      if (!api) throw new ApiError("Not connected", 0);
      await api.action(action, key);
      await refresh();
    },
    [api, refresh],
  );

  const saveConnection = useCallback(async (url: string, tok: string) => {
    const clean = normalizeBaseUrl(url);
    await SecureStore.setItemAsync(URL_KEY, clean);
    await SecureStore.setItemAsync(TOKEN_KEY, tok.trim());
    setBaseUrl(clean);
    setToken(tok.trim());
    setState(null);
    setError(null);
  }, []);

  const setFilters = useCallback((f: Filters) => {
    setFiltersState(f);
    AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(f)).catch(() => {});
  }, []);

  const value: DataContextValue = {
    ready, configured: !!baseUrl, baseUrl, token, api, state, error, loading, refresh, act, saveConnection, filters, setFilters,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
