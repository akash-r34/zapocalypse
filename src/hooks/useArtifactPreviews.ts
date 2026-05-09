"use client";

import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";

export interface ArtifactPreview {
  firstTweet?: string;
  linkedInHook?: string;
  newsletterSubject?: string;
}

export function useArtifactPreviews(projectIds: string[]): Record<string, ArtifactPreview> {
  const [previews, setPreviews] = useState<Record<string, ArtifactPreview>>({});
  const fetchedRef = useRef<string>("");

  const key = projectIds.slice().sort().join(",");

  useEffect(() => {
    if (!projectIds.length || fetchedRef.current === key) return;

    const db = getClientFirestore();

    const fetchAll = projectIds.map(async (id) => {
      const [twitterSnap, linkedInSnap, newsletterSnap] = await Promise.allSettled([
        getDoc(doc(db, "projects", id, "outputs", "twitter")),
        getDoc(doc(db, "projects", id, "outputs", "linkedin")),
        getDoc(doc(db, "projects", id, "outputs", "newsletter")),
      ]);

      const preview: ArtifactPreview = {};

      if (twitterSnap.status === "fulfilled" && twitterSnap.value.exists()) {
        const tweets = twitterSnap.value.data().tweets as Array<{ text: string }> | undefined;
        const text = tweets?.[0]?.text;
        if (text) preview.firstTweet = text.length > 100 ? text.slice(0, 97) + "…" : text;
      }

      if (linkedInSnap.status === "fulfilled" && linkedInSnap.value.exists()) {
        const posts = linkedInSnap.value.data().posts as Array<{ hook: string }> | undefined;
        const hook = posts?.[0]?.hook;
        if (hook) preview.linkedInHook = hook.length > 80 ? hook.slice(0, 77) + "…" : hook;
      }

      if (newsletterSnap.status === "fulfilled" && newsletterSnap.value.exists()) {
        const subject = newsletterSnap.value.data().subject_line as string | undefined;
        if (subject) preview.newsletterSubject = subject;
      }

      return [id, preview] as const;
    });

    Promise.allSettled(fetchAll).then((results) => {
      fetchedRef.current = key;
      const map: Record<string, ArtifactPreview> = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          const [id, preview] = r.value;
          map[id] = preview;
        }
      }
      setPreviews(map);
    });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return previews;
}
