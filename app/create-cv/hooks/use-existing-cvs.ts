"use client";

import { useEffect, useState } from "react";
import type { CV } from "@/app/create-cv/types/cv";

/** Loads the signed-in user's previously uploaded CVs (empty for guests). */
export function useExistingCvs(userId: string | undefined) {
  const [cvs, setCvs] = useState<CV[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchCvs = async () => {
      try {
        const res = await fetch("/api/cvs");
        const json = await res.json();
        setCvs(json.data ?? []);
      } catch {
        // Non-critical: without saved CVs the user can still upload a new one.
      }
    };

    fetchCvs();
  }, [userId]);

  return cvs;
}
