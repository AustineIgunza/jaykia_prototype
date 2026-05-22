"use client";

import { useEffect, useRef, useState } from "react";
import { getApiClient, type ApiClient } from "./client";

export function useApi(): ApiClient | null {
  const [client, setClient] = useState<ApiClient | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    getApiClient().then(setClient);
  }, []);

  return client;
}
