"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/services/api";
import type { RequestStatus } from "@/types/api";

/** Estado estándar de petición: loading | success | error | empty. */
export function useApi<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await loader();
      const empty =
        res == null ||
        (Array.isArray(res) && res.length === 0) ||
        (typeof res === "object" &&
          res !== null &&
          "data" in res &&
          Array.isArray((res as { data: unknown[] }).data) &&
          (res as { data: unknown[] }).data.length === 0);
      setData(res);
      setStatus(empty ? "empty" : "success");
    } catch (e) {
      setStatus("error");
      setError(e instanceof ApiError ? e.message : "Error inesperado");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, status, error, reload: load };
}
