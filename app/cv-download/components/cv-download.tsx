"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CvTemplate from "@/app/create-cv/components/cv-template";
import type { CVData } from "@/app/create-cv/types/cv-data";
import { Loader2 } from "lucide-react";

export default function CvDownload() {
  const searchParams = useSearchParams();
  const cvId = searchParams.get("cvId");
  const lang = searchParams.get("lang");
  const renderToken = searchParams.get("renderToken");

  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cvId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/cv-data?cvId=${encodeURIComponent(cvId)}` +
            (renderToken
              ? `&renderToken=${encodeURIComponent(renderToken)}`
              : ""),
          { cache: "no-store" },
        );
        const json = await res.json();
        if (json.success) {
          setCvData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch CV data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cvId, renderToken]);

  if (!cvId) {
    return <div className="p-6">Missing CV id. Please check the link.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="p-6">
        CV not found. Please check that the link is correct.
      </div>
    );
  }

  return (
    <div data-cv-ready>
      <CvTemplate cvData={cvData} lang={lang ?? "en"} />
    </div>
  );
}
