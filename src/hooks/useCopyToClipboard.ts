"use client";

import { useState, useCallback } from "react";

export function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback(async (text: string, id?: string) => {
    await navigator.clipboard.writeText(text);
    const key = id ?? "default";
    setCopiedId(key);
    setTimeout(() => setCopiedId((prev) => (prev === key ? null : prev)), 2000);
  }, []);

  const isCopied = useCallback(
    (id?: string) => copiedId === (id ?? "default"),
    [copiedId]
  );

  return { copy, isCopied };
}
